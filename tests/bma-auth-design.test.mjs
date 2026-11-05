import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import test from "node:test";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("both auth routes share a compact, properly composed frame",()=>{
 const wrapper=read("src/components/auth/auth-frame.tsx");
 const frame=read("src/components/auth/bma-auth-frame.tsx");
 assert.match(wrapper,/pathname==="\/login"/);
 assert.match(wrapper,/BmaAuthFrame/);
 assert.match(frame,/lg:h-dvh/);
 assert.match(frame,/lg:overflow-hidden/);
 assert.match(frame,/lg:overflow-y-auto/);
 assert.match(frame,/object-fill/);
 assert.match(frame,/bma-signup-logo\.svg/);
 assert.doesNotMatch(frame,/bma-signup-logo\.jpg/);
 for(const asset of ["bma-signup-hero-v2.jpg","bma-login-hero-v2.jpg"]){
  assert.ok(frame.includes(asset));
  assert.ok(existsSync(new URL("../public/brand/"+asset,import.meta.url)));
 }
});
test("sign-in keeps live login, MFA, reset notices and safe redirects",()=>{
 const page=read("src/app/(auth)/login/page.tsx");
 const form=read("src/components/auth/bma-login-form.tsx");
 assert.match(page,/BmaLoginForm/);
 for(const part of ['"/auth/login"','"/auth/mfa/verify"',"liveSession()","safeAuthNext","router.refresh()","/forgot-password","/signup","one-time-code","showPassword"]) assert.ok(form.includes(part),part);
 assert.match(form,/result\.challengeId&&result\.ticket/);
 assert.match(form,/status=params\.get\("verified"\)/);
 assert.doesNotMatch(form,/localStorage|sessionStorage|mockLogin/);
 assert.match(read("src/app/(auth)/signin/page.tsx"),/redirect\("\/login"\)/);
});
