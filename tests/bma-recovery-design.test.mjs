import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("forgot and reset use the same compact BMA frame as sign-in",()=>{
 const frame=read("src/components/auth/auth-frame.tsx");
 const art=read("src/components/auth/bma-auth-frame.tsx");
 assert.match(frame,/pathname==="\/forgot-password"/);
 assert.match(frame,/pathname==="\/reset-password"/);
 assert.match(art,/mode==="login"/);
 assert.match(art,/bma-login-hero-v2\.jpg/);
 assert.match(art,/bma-signup-logo\.svg/);
 assert.match(read("src/app/(auth)/forgot-password/page.tsx"),/BmaRecoveryForm mode="forgot"/);
 assert.match(read("src/app/(auth)/reset-password/page.tsx"),/BmaRecoveryForm mode="reset"/);
});
test("forgot request preserves privacy and reset link remains in URL fragment only",()=>{
 const form=read("src/components/auth/bma-recovery-form.tsx");
 const backend=read("backend/src/modules/auth/routes.ts");
 assert.match(form,/api\("\/auth\/forgot-password"/);
 assert.match(form,/api\("\/auth\/reset-password"/);
 assert.match(form,/newPassword:password/);
 assert.match(form,/window\.location\.hash/);
 assert.match(form,/window\.history\.replaceState/);
 assert.match(form,/validPassword/);
 assert.match(form,/password!==confirm/);
 assert.match(form,/router\.replace\("\/login\?reset=1"\)/);
 assert.match(backend,/If your account is eligible, reset instructions have been sent/);
 assert.match(backend,/reset-password#token=/);
});
