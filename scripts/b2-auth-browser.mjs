import assert from "node:assert/strict";
import {launchBrowser} from "./browser-engine.mjs";
import {saveBrowserFailure} from "./browser-evidence.mjs";
const BASE=process.env.BASE_URL||"http://127.0.0.1:3101";
const id="11111111-1111-4111-8111-111111111111";
const browser=await launchBrowser();
try{
 const context=await browser.newContext();
 const page=await context.newPage();
 const actions=[];
 let signedIn=false;
 await page.route("**/api/backend/**",async route=>{
  const request=route.request(),path=new URL(request.url()).pathname.replace("/api/backend","");
  const body=JSON.parse(request.postData()||"{}");
  actions.push({path,body});
  const send=(status,data)=>route.fulfill({status,contentType:"application/json",body:JSON.stringify({data})});
  if(path==="/auth/register"){
   assert.equal(body.role,"driver");
   return send(201,{challengeId:id});
  }
  if(path==="/auth/verify"){
   assert.equal(body.challengeId,id);
   assert.equal(body.code,"123456");
   return send(201,{message:"Verified"});
  }
  if(path==="/auth/forgot-password")return send(201,{message:"If eligible"});
  if(path==="/auth/reset-password"){
   assert.ok(body.resetToken.startsWith(id+"."));
   return send(201,{message:"Password updated"});
  }
  if(path==="/auth/login"){signedIn=true;return send(201,{userId:id,role:"driver"});}
  if(path==="/auth/session"){
   if(!signedIn)return route.fulfill({status:401,contentType:"application/json",
    body:JSON.stringify({error:{code:"UNAUTHENTICATED",message:"Sign in required"}})});
   return send(200,{userId:id,role:"driver",csrfToken:"a".repeat(64),expiresAt:"2090-01-01T00:00:00Z"});
  }
  if(path==="/drivers/me")return send(200,{id,displayName:"Driver"});
  return send(200,[]);
 });
 await page.goto(BASE+"/signup?role=driver");
 assert.equal(await page.getByLabel("Account type").inputValue(),"driver");
 await page.getByLabel("Full name").fill("Example Driver");
 await page.getByLabel("Email").fill("driver@example.invalid");
 await page.getByLabel("Password",{exact:true}).fill("SecurePasswordForTesting!2026");
 await page.getByRole("button",{name:"Register"}).click();
 await page.waitForURL("**/verify?challengeId="+id);
 await page.reload();
 assert.equal(await page.getByLabel("Challenge ID").inputValue(),id);
 await page.getByLabel("Email code").fill("123456");
 await page.getByRole("button",{name:"Verify",exact:true}).click();
 await page.waitForURL("**/login?verified=1");
 await page.goto(BASE+"/forgot-password");
 await page.getByLabel("Email").fill("driver@example.invalid");
 await page.getByRole("button",{name:"Send recovery email"}).click();
 await page.getByText("If the account is eligible, recovery instructions have been sent.").waitFor();
 await page.goto(BASE+"/reset-password#token="+id+"."+"b".repeat(43));
 await page.getByLabel("New password").fill("SecureSecondPassword!2026");
 await page.getByRole("button",{name:"Reset password"}).click();
 await page.waitForURL("**/login?reset=1");
 await page.getByLabel("Email").fill("driver@example.invalid");
 await page.getByLabel("Password",{exact:true}).fill("SecureSecondPassword!2026");
 await page.getByRole("button",{name:"Sign in",exact:true}).click();
 await page.waitForURL("**/driver");
 for(const endpoint of ["/auth/register","/auth/verify","/auth/forgot-password",
  "/auth/reset-password","/auth/login","/auth/session"])
  assert.ok(actions.some(x=>x.path===endpoint),endpoint);
 console.log("Part 2 auth browser contract passed");
 await context.close();
}catch(error){await saveBrowserFailure(browser,"auth",error);throw error;}
finally{await browser.close();}
