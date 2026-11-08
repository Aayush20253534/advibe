import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
test("frontend authentication uses real backend endpoints, never a demo identity",()=>{
 const source=read("src/components/auth/api-auth-screen.tsx");
 for(const endpoint of ["/auth/login","/auth/register","/auth/verify","/auth/resend-verification",
  "/auth/mfa/verify","/auth/forgot-password","/auth/reset-password"])
  assert.ok(source.includes(endpoint),endpoint);
 assert.match(source,/safeAuthNext/);
 assert.match(source,/challengeId=/);
 assert.doesNotMatch(source,/demo-auth|localStorage|sessionStorage/);
 const client=read("src/services/api-client.ts");
 assert.match(client,/Date\.parse\(session\.expiresAt\)<=Date\.now\(\)/);
});
test("email deep links and protected portal sessions are present",()=>{
 const backend=read("backend/src/modules/auth/routes.ts");
 assert.match(backend,/webOrigin \+ "\/verify\?challengeId="/);
 assert.match(backend,/resend-verification/);
 const portal=read("src/features/live/api-portal.tsx");
 assert.match(portal,/visibilitychange/);
 assert.match(read("src/features/driver-live/common.tsx"),/e\.status === 401/);
});
