import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read=path=>fs.readFileSync(path,"utf8");
test("body and app text use the platform UI font; headings use self-hosted Manrope",()=>{
 const css=read("src/app/globals.css");
 // Body and app text: platform UI font stack (unchanged).
 assert.match(css,/--font-facebook-ui:\s*system-ui/);
 assert.match(css,/--font-sans:\s*var\(--font-facebook-ui\)/);
 assert.match(css,/font-family:\s*var\(--font-facebook-ui\)/);
 assert.doesNotMatch(css,/font-family:\s*Inter,/);
 // Headings and display text only: Manrope via next/font, falling back to the UI font.
 assert.match(css,/--font-heading-stack:\s*var\(--font-manrope\),\s*var\(--font-facebook-ui\)/);
 assert.match(css,/:where\(h1, h2, h3\)\s*\{\s*font-family:\s*var\(--font-heading-stack\)/);
 const root=read("src/app/layout.tsx");
 assert.match(root,/import \{ Manrope \} from "next\/font\/google"/);
 assert.match(root,/variable:\s*"--font-manrope"/);
 assert.match(root,/className=\{manrope\.variable\}/);
 assert.doesNotMatch(root,/fonts\.googleapis\.com/);
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
