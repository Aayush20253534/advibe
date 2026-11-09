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
    const paths=width===768?["/","/locations","/how-it-works","/login"]:["/","/for-advertisers","/for-drivers","/ad-formats","/how-it-works","/pricing","/locations","/about","/contact","/help-center","/login","/signup","/forgot-password","/reset-password","/verify"];
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
        assert.ok(await footer.evaluate(el=>getComputedStyle(el).backgroundImage.includes("gradient")),`${path}: metallic-blue gradient footer`);
      }
      if(path==="/login"||path==="/signup"){
        assert.equal(await page.locator(".bma-ref-nav").count(),0,`${path}: marketing navbar is absent`);
        assert.equal(await page.locator(".bma-auth-minimal-shell > header").count(),0,`${path}: no separate header band`);
        const homeLogo=page.locator(width>900?".bma-reference-auth-home a[href='/']":".bma-reference-auth-mobile-home a[href='/']");
        assert.equal(await homeLogo.count(),1,`${path}: one home-linked BlinkMyAd logo`);
        assert.ok(await homeLogo.isVisible(),`${path}: home logo is visible`);
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
