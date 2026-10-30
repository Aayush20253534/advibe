import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read=path=>fs.readFileSync(path,"utf8");
test("every AdVibe surface inherits Facebook-style platform UI font",()=>{
 const css=read("src/app/globals.css");
 assert.match(css,/--font-facebook-ui:\s*system-ui/);
 assert.match(css,/--font-sans:\s*var\(--font-facebook-ui\)/);
 assert.match(css,/font-family:\s*var\(--font-facebook-ui\)/);
 assert.doesNotMatch(css,/font-family:\s*Inter,/);
 const root=read("src/app/layout.tsx");
 assert.match(root,/<MockProviderBanner\s*\/>/);
});
test("proxy allows only read-only status path for mock indication",()=>{
 const policy=read("src/services/api-route-policy.mjs");
 const app=read("backend/src/app.ts");
 assert.match(policy,/"integrations"/);
 assert.match(app,/\/api\/v1\/integrations\/status/);
 assert.match(app,/externalMode\(\)/);
 assert.match(read("src/components/layout/mock-provider-banner.tsx"),/mode==="mock"/);
});
