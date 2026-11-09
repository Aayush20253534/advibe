// Synthetic frontend QA only. No provider calls, user accounts or commercial actions.
import assert from "node:assert/strict";
import { AxeBuilder } from "@axe-core/playwright";
import { browserName, launchBrowser } from "./browser-engine.mjs";
import { saveBrowserEvidence, saveBrowserFailure } from "./browser-evidence.mjs";

const base=process.env.BASE_URL??"http://127.0.0.1:3101";
const browser=await launchBrowser();
async function preparePublicPage(page){
  // Exercise each viewport so native lazy images and intersection observers run.
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let top=0;top<height;top+=700){
    await page.evaluate(y=>window.scrollTo(0,y),top);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  }
  await page.waitForFunction(()=>Array.from(document.images).filter(img=>img.getClientRects().length>0).every(img=>img.complete));
  const broken=await page.evaluate(()=>Array.from(document.images).filter(img=>img.getClientRects().length>0&&!img.naturalWidth).map(img=>img.currentSrc));
  assert.deepEqual(broken,[],"Rendered images load successfully");
  await page.evaluate(()=>window.scrollTo(0,0));
}
try{
  for(const width of [390,768,1440]){
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:"reduce"});
    await context.route("**/api/backend/**",route=>route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:{code:"TEST_UNAVAILABLE",message:"Temporary service interruption"}})}));
    const page=await context.newPage();
    const errors=[];page.on("pageerror",error=>errors.push(error.message));
    const paths=width===768?["/","/locations","/how-it-works","/for-drivers","/for-advertisers","/login"]:["/","/for-advertisers","/for-drivers","/ad-formats","/how-it-works","/pricing","/locations","/about","/contact","/help-center","/login","/signup","/forgot-password","/reset-password","/verify"];
    for(const path of paths){
      await page.goto(base+path,{waitUntil:"domcontentloaded",timeout:45000});
      await page.locator("h1").waitFor({state:"visible",timeout:45000});
      await page.evaluate(()=>document.fonts.ready);
      await preparePublicPage(page);
      assert.equal(await page.locator("h1").count(),1,`${path}: one primary heading`);
      if(!["/login","/signup","/forgot-password","/reset-password","/verify"].includes(path)){
        const footer=page.locator("footer.bma-public-footer");
        assert.equal(await footer.count(),1,`${path}: shared public footer appears once`);
        assert.equal(await footer.locator(".bma-public-footer-column").count(),4,`${path}: shared footer columns`);
        const footerBackground=await footer.evaluate(el=>({
          base:getComputedStyle(el).backgroundImage,
          reflection:getComputedStyle(el,"::before").backgroundImage,
        }));
        assert.ok(footerBackground.base.includes("gradient"),`${path}: metallic-blue gradient footer: ${JSON.stringify(footerBackground)}`);
      }
      if(path==="/login"||path==="/signup"){
        assert.equal(await page.locator(".bma-ref-nav").count(),0,`${path}: marketing navbar is absent`);
        assert.equal(await page.locator(".bma-auth-minimal-shell > header").count(),0,`${path}: no separate header band`);
        const homeLogo=page.locator(width>900?".bma-reference-auth-home a[href='/']":".bma-reference-auth-mobile-home a[href='/']");
        assert.equal(await homeLogo.count(),1,`${path}: one home-linked BlinkMyAd logo`);
        assert.ok(await homeLogo.isVisible(),`${path}: home logo is visible`);
      }
      if(path==="/for-advertisers"){
        assert.equal(await page.getByRole("heading",{name:/Make your next.*move visible/s}).count(),1,"Advertiser headline matches reference");
        assert.equal(await page.locator(".bma-advertisers-advantage").count(),4,"Four advertiser benefit cards");
        assert.equal(await page.locator(".bma-advertisers-step").count(),4,"Four campaign stages");
        assert.equal(await page.locator(".bma-advertisers-format").count(),3,"Three vehicle formats");
        assert.equal(await page.locator(".bma-advertisers-faq-list details").count(),5,"Five advertiser FAQs");
        const advertiserHero=page.locator(".bma-advertisers-hero-art img");
        assert.equal(await advertiserHero.count(),1,"Single advertiser hero artwork");
        assert.equal(await advertiserHero.getAttribute("src"),"/images/hero/009.png","Uploaded advertiser hero 009.png");
        assert.ok(await advertiserHero.evaluate(img=>img.complete&&img.naturalWidth>0),"Advertiser PNG loads");
        assert.equal(await page.locator(".bma-advertisers-hero-car").count(),0,"No duplicate car panel over uploaded artwork");
        const advFAQ=page.locator(".bma-advertisers-faq-list details").first();
        await advFAQ.locator("summary").click();
        assert.ok(await advFAQ.evaluate(el=>el.open),"Advertiser FAQ expands");
        await advFAQ.locator("summary").click();
        assert.ok(!await advFAQ.evaluate(el=>el.open),"Advertiser FAQ closes");
        const closing=page.locator(".bma-advertisers-closing");
        assert.equal(await closing.count(),1,"Advertiser closing banner rendered once");
        assert.ok(await closing.evaluate(el=>getComputedStyle(el).backgroundImage.includes("cta-wave.webp")),"Advertiser closing banner uses matching blue wave");
        assert.equal(await closing.getByRole("link",{name:/Create an advertiser account/}).getAttribute("href"),"/signup?role=advertiser");
        assert.equal(await page.getByRole("link",{name:"Estimate the cost"}).getAttribute("href"),"/pricing");
      }
      if(path==="/for-drivers"){
        assert.equal(await page.getByRole("heading",{name:/Drive your routes/}).count(),1,"Dedicated driver hero exists");
        const driverHero=page.locator(".bma-driver-hero-art img");
        assert.equal(await driverHero.getAttribute("src"),"/images/hero/234.png","Use uploaded driver hero 234.png");
        assert.ok(await driverHero.evaluate(img=>img.complete&&img.naturalWidth>0),"Uploaded driver hero loads");
        const heroGuide=page.locator(".bma-driver-hero-guide");
        assert.equal(await heroGuide.count(),1,"Driver guide bridges the hero text and artwork");
        assert.equal(await heroGuide.locator("li").count(),3,"Driver guide describes three verified stages");
        if(width>1360)assert.ok(await heroGuide.isVisible(),"Driver journey card visible on wide desktop");
        assert.equal(await page.locator(".bma-driver-benefit-card").count(),4,"Four driver benefit cards");
        assert.equal(await page.locator(".bma-driver-process-card").count(),4,"Four driver onboarding steps");
        assert.equal(await page.locator(".bma-driver-trust-card").count(),4,"Four safety and trust cards");
        const selector=page.getByRole("group",{name:"Vehicle type"});
        assert.equal(await selector.getByRole("button").count(),3,"Bike, auto and car selection available");
        await selector.getByRole("button",{name:"Auto rickshaw"}).click();
        assert.equal(await page.locator(".bma-driver-vehicle-description h3").innerText(),"Auto rickshaw");
        await selector.getByRole("button",{name:"Car",exact:true}).click();
        assert.equal(await page.locator(".bma-driver-vehicle-description h3").innerText(),"Car");
        await selector.getByRole("button",{name:"Bike"}).click();
        assert.equal(await page.locator(".bma-driver-vehicle-description h3").innerText(),"Bike");
        assert.equal(await page.locator(".bma-driver-faq-list details").count(),5,"Five driver questions");
        const faq=page.locator(".bma-driver-faq-list details").first();
        assert.ok(await faq.evaluate(el=>el.open),"First driver answer expanded by default");
        await faq.locator("summary").click();
        assert.ok(!await faq.evaluate(el=>el.open),"Driver FAQ closes on click");
        const closing=page.locator(".bma-driver-closing");
        assert.ok(await closing.evaluate(el=>getComputedStyle(el).backgroundImage.includes("cta-wave.webp")),"Driver CTA has matching metallic-blue wave");
        assert.equal(await closing.getByRole("link",{name:"Apply as a driver partner"}).getAttribute("href"),"/signup?role=driver");
      }
      if(path==="/how-it-works"){
        assert.equal(await page.getByRole("heading",{name:"How BlinkMyAd works"}).count(),1,"Dedicated workflow hero exists");
        const heroImage=page.locator(".bma-how-hero-visual img");
        assert.equal(await heroImage.count(),1,"One dedicated How It Works image");
        assert.equal(await heroImage.getAttribute("src"),"/images/hero/img.png","Use the full user-uploaded hero asset");
        assert.equal(await heroImage.evaluate(img=>getComputedStyle(img).objectFit),"cover","Artwork uses cinematic cover composition");
        assert.equal(await page.locator(".bma-how-hero-visual").evaluate(el=>getComputedStyle(el).position),"absolute","Vehicle artwork is blended into the hero, not a detached panel");
        assert.ok(await heroImage.evaluate(img=>img.complete&&img.naturalWidth>0),"Hero PNG loads successfully");
        assert.equal(await page.locator(".bma-how-overview-card").count(),4,"Four overview stages");
        assert.equal(await page.locator(".bma-how-journey").count(),2,"Both advertiser and driver journeys");
        assert.equal(await page.locator(".bma-how-detail-card").count(),6,"Six detailed workflow stages");
        assert.equal(await page.locator(".bma-how-faq details").count(),5,"Five workflow FAQs");
        const closing=page.locator(".bma-how-final");
        assert.equal(await closing.count(),1,"Closing CTA appears once");
        assert.ok(await closing.evaluate(el=>getComputedStyle(el).backgroundImage.includes("cta-wave.webp")),"How It Works uses shared metallic wave CTA art");
        assert.equal(await page.locator(".bma-how-final-art").count(),0,"Closing CTA is clean without oversized vehicle crop");
        const faq=page.locator(".bma-how-faq details").first();
        await faq.locator("summary").click();
        assert.ok(await faq.evaluate(node=>node.open),"FAQ disclosure opens");
        await faq.locator("summary").click();
        assert.ok(!await faq.evaluate(node=>node.open),"FAQ disclosure closes");
        assert.equal(await page.getByRole("link",{name:"Start a campaign"}).getAttribute("href"),"/signup?role=advertiser");
        assert.equal(await page.getByRole("link",{name:"Become a driver partner"}).getAttribute("href"),"/signup?role=driver");
      }
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${path}: no overflow at ${width}`);
      if(width===1440 && (path==="/login"||path==="/signup")){
        const fit=await page.evaluate(()=>{
          const form=document.querySelector(".bma-reference-auth .bma-auth-form-wrap");
          const panel=document.querySelector(".bma-reference-auth");
          const backdrop=document.querySelector(".bma-reference-auth-backdrop");
          return {
            documentFits: document.documentElement.scrollHeight<=window.innerHeight+2,
            formFits: !!form && form.scrollHeight<=form.clientHeight+2,
            backgroundLoaded: !!backdrop && backdrop.complete && backdrop.naturalWidth>0,
            panelFits: !!panel && panel.getBoundingClientRect().top<=2 && panel.getBoundingClientRect().bottom>=window.innerHeight-2 && panel.getBoundingClientRect().bottom<=window.innerHeight+2,
            cardFits: (()=>{const card=form?.querySelector(".bma-auth-card");if(!card)return false;const b=card.getBoundingClientRect();return b.top>=-2&&b.bottom<=window.innerHeight+2;})(),
            noInternalScrollbar: !!form && getComputedStyle(form).overflowY!=="auto" && getComputedStyle(form).overflowY!=="scroll"
          };
        });
        assert.ok(fit.documentFits && fit.formFits && fit.backgroundLoaded && fit.panelFits && fit.cardFits && fit.noInternalScrollbar,
          `${path}: desktop auth must fit viewport with the uploaded background: ${JSON.stringify(fit)}`);
      }
      const result=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
      await saveBrowserEvidence(page,`${path.slice(1)||"home"}-${width}`,{violations:result.violations});
      assert.deepEqual(result.violations.filter(x=>["serious","critical"].includes(x.impact)).map(x=>x.id),[],`${path}: accessibility at ${width}`);
      if(path==="/locations")await page.getByRole("heading",{name:"Coverage data is unavailable"}).waitFor();
    }
    await page.goto(base+"/",{waitUntil:"domcontentloaded",timeout:45000});
    await page.locator("h1").waitFor({state:"visible",timeout:45000});
    assert.equal(await page.locator(".bma-ref-format-grid article").count(),3);
    await page.getByRole("combobox",{name:"Preview ad format"}).selectOption("In-car screens");
    assert.equal(await page.getByRole("combobox",{name:"Preview ad format"}).inputValue(),"In-car screens");
    await page.getByRole("button",{name:"Change sample creative"}).click();
    assert.match(await page.getByRole("status").innerText(),/In-car screens\. Sample creative 2 of 3/);
    assert.equal(await page.getByRole("link",{name:"Review campaign",exact:false}).getAttribute("href"),"/signup?role=advertiser");
    if(width<900){
      const open=page.getByRole("button",{name:"Open public navigation"});await open.click();
      await page.getByRole("dialog",{name:"Public navigation menu"}).waitFor();
      await page.keyboard.press("Escape");
      await page.getByRole("dialog",{name:"Public navigation menu"}).waitFor({state:"detached"});
      await page.waitForFunction(()=>document.activeElement?.getAttribute("aria-label")==="Open public navigation");
    }
    assert.deepEqual(errors,[],"Uncaught browser errors");
    await context.close();
  }
  console.log(`${browserName}: public responsive, failure, keyboard and axe checks passed`);
}catch(error){await saveBrowserFailure(browser,"public",error);throw error;}
finally{await browser.close();}
