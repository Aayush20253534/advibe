import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import test from "node:test";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("both auth routes share a compact, properly composed frame",()=>{
 const wrapper=read("src/components/auth/auth-frame.tsx");
 const frame=read("src/components/auth/bma-auth-frame.tsx");
 assert.match(wrapper,/BmaAuthFrame mode=\{mode\}/);
 assert.match(frame,/BrandLogo/);
 assert.match(frame,/bma-auth-form-wrap/);
 assert.match(frame,/object-cover/);
 assert.doesNotMatch(frame,/object-fill/);
 assert.ok(existsSync(new URL("../public/images/blinkmyad/fleet.webp",import.meta.url)));
 const css=read("src/components/landing/homepage.css");
 assert.match(css,/min-height:100dvh/);
 assert.match(css,/max-width:420px/);

});
test("sign-in keeps live login, MFA, reset notices and safe redirects",()=>{
 const page=read("src/app/(auth)/login/page.tsx");
 const form=read("src/components/auth/bma-login-form.tsx");
 assert.match(page,/BmaLoginForm/);
 for(const part of ['"/auth/login"','"/auth/mfa/verify"',"liveSession()","safeAuthNext","router.refresh()","/forgot-password","/signup","one-time-code","showPassword"]) assert.ok(form.includes(part),part);
 assert.match(form,/result\.challengeId&&result\.ticket/);
 assert.match(form,/!remember \? \{ remember: false \} : \{\}/,"Normal sign-in omits optional persistence override");
 assert.match(form,/status=params\.get\("verified"\)/);
 assert.match(form,/loginRole: adminSignIn \? undefined : role/,"Selected account role is sent with login, except admin MFA");
 assert.match(form,/session\.role !== intendedRole/,"Legacy backend role mismatches are rejected in browser");
 assert.match(form,/ACCOUNT_ROLE_MISMATCH/);
 assert.doesNotMatch(form,/localStorage|sessionStorage|mockLogin/);
 assert.match(read("src/app/(auth)/signin/page.tsx"),/redirect\("\/login"\)/);
});
