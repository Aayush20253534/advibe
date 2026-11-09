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
    const paths=width===768?["/","/locations","/login"]:["/","/for-advertisers","/for-drivers","/ad-formats","/pricing","/locations","/about","/contact","/help-center","/login","/signup","/forgot-password","/reset-password","/verify"];
    for(const path of paths){
      await page.goto(base+path,{waitUntil:"domcontentloaded",timeout:45000});
      await page.locator("h1").waitFor({state:"visible",timeout:45000});
      await page.evaluate(()=>document.fonts.ready);
      await preparePublicPage(page);
      assert.equal(await page.locator("h1").count(),1,`${path}: one primary heading`);
      if(path==="/login"||path==="/signup"){
        assert.equal(await page.locator(".bma-ref-nav").count(),0,`${path}: marketing navbar is absent`);
        const homeLogo=page.locator(".bma-auth-minimal-header a[href='/']");
        assert.equal(await homeLogo.count(),1,`${path}: one home-linked BlinkMyAd logo`);
        assert.ok(await homeLogo.isVisible(),`${path}: home logo is visible`);
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
            panelFits: !!panel && panel.getBoundingClientRect().bottom<=window.innerHeight+2
          };
        });
        assert.ok(fit.documentFits && fit.formFits && fit.backgroundLoaded && fit.panelFits,
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
