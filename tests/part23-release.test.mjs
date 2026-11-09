import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const read=p=>fs.readFileSync(path.join(process.cwd(),p),"utf8");
const exists=p=>fs.existsSync(path.join(process.cwd(),p));

test("health route identifies only frontend liveness without declaring provider readiness",()=>{
 const source=read("src/app/api/health/route.ts");
 assert.match(source,/service:"advibe-frontend"/);
 assert.match(source,/productionIntegrationsReady:false/);
 assert.match(source,/no-store/);
 assert.doesNotMatch(source,/process\.env\.(CASHFREE_SECRET_KEY|DATABASE_URL|AUTH_SECRET)/);
});
test("search indexing requires an explicit release gate",()=>{
 const robots=read("src/app/robots.ts"),sitemap=read("src/app/sitemap.ts");
 assert.match(robots,/SITE_INDEXING_ENABLED==="true"/);
 assert.match(robots,/disallow:"\/"/);
 assert.match(sitemap,/SITE_INDEXING_ENABLED!=="true"/);
 assert.match(sitemap,/origin\.protocol!=="https:"/);
 assert.doesNotMatch(sitemap,/\/admin/);
});
test("all key public, auth and three portal pages exist as explicit Next.js routes",()=>{
 const publicPaths=["","for-advertisers","for-drivers","ad-formats","locations","pricing","about","contact","help-center","privacy","terms"];
 const authPaths=["login","signup","verify","forgot-password","reset-password"];
 const paths=[
  ...publicPaths.map(p=>"src/app/(site)/"+(p?p+"/":"")+"page.tsx"),
  ...authPaths.map(p=>"src/app/(auth)/"+p+"/page.tsx"),
  ...["admin","advertiser","driver"].map(p=>"src/app/(portals)/"+(p==="admin"?"0000BMA0/admin":p)+"/page.tsx"),
  "src/app/(auth)/0000BMA0/admin/login/page.tsx",
  "src/app/api/health/route.ts"
 ];
 for(const file of paths)assert.equal(exists(file),true,"Missing route "+file);
 const roles=["0000BMA0/admin","advertiser","driver"];
 for(const role of roles){
  const dirs=fs.readdirSync("src/app/(portals)/"+role,{withFileTypes:true});
  for(const dir of dirs.filter(d=>d.isDirectory()&&!d.name.startsWith("["))){
   assert.equal(exists("src/app/(portals)/"+role+"/"+dir.name+"/page.tsx"),true,"Incomplete route "+role+"/"+dir.name);
  }
 }
 assert.equal(exists("src/app/(portals)/admin/page.tsx"),false,"Old Admin route should not remain as an independent page");
});
test("release scripts, API browser job and legal warnings are present",()=>{
 const workflow=read(".github/workflows/ci.yml");
 assert.match(workflow,/live-portal-smoke:/);
 assert.ok(/playwright install --with-deps chromium/.test(workflow)||
  /image:\s*mcr\.microsoft\.com\/playwright:v1\.56\.1-noble/.test(workflow),
  "Browser job must install Playwright system dependencies or use its preinstalled version-matched image");
 assert.match(workflow,/npm run test:live-browser/);
 assert.ok(exists("scripts/release-smoke.mjs"));
 assert.ok(exists("scripts/deployment-health.mjs"));
 for(const page of ["privacy","terms"])assert.match(read("src/app/(site)/"+page+"/page.tsx"),/Legal approval pending|legal approval pending|Legal Review Pending/);
});
test("no false provider readiness is advertised by backend-only mode",()=>{
 const env=read(".env.example"),app=read("src/app/api/health/route.ts");
 assert.doesNotMatch(env,/NEXT_PUBLIC_DEMO_MODE/);
 assert.match(app,/productionIntegrationsReady:false/);
 assert.ok(!env.includes("CASHFREE_SECRET_KEY="));
});
