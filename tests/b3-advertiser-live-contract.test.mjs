import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {allowedApiPath} from "../src/services/api-route-policy.mjs";
const read=p=>fs.readFileSync(p,"utf8");
test("advertiser runtime is dedicated API portal with no demo-store imports",()=>{
 const layout=read("src/app/(portals)/advertiser/layout.tsx");
 assert.match(layout,/AdvertiserPortal/);
 assert.doesNotMatch(layout,/ApiPortal|PortalGate|demo/);
 const files=["common.tsx","portal.tsx","workflows.tsx","operations.tsx"].map(x=>read("src/features/advertiser-live/"+x));
 for(const s of files)assert.doesNotMatch(s,/demo-auth|demo-store|DEMO_USERS|DEMO_CODE|localStorage|sessionStorage/);
 assert.match(files[1],/liveSession\(\)/);
 assert.match(files[1],/Auth\.Provider/);
});
test("all advertiser mutations use real contracts and CSRF",()=>{
 const workflows=read("src/features/advertiser-live/workflows.tsx");
 const operations=read("src/features/advertiser-live/operations.tsx");
 for(const s of ["/campaigns","/campaigns/","/creatives/upload-intents","/creatives/assets/","/creatives"])
  assert.ok(workflows.includes(s),"workflow "+s);
 for(const s of ["/me","/businesses","/public/locations","/inventory/screens","/pricing/quotes","/payments",
  "/support/tickets","/notifications"])
  assert.ok(operations.includes(s),"operations "+s);
 assert.match(workflows,/crypto\.subtle\.digest/);
 assert.match(workflows,/credentials:"omit"/);
 assert.match(workflows,/redirect:"error"/);
 assert.match(workflows,/csrfToken:session\.csrfToken/);
 assert.match(operations,/csrfToken:session\.csrfToken/);
 assert.doesNotMatch(operations,/\bconfirmed human impressions\b/i);
});
test("the inventory catalog is role-limited, privacy-safe and proxy permitted",()=>{
 const route=read("backend/src/modules/devices/routes.ts");
 assert.match(route,/router\.get\("\/inventory\/screens"/);
 assert.match(route,/requireRole\(p,"ADVERTISER"\)/);
 assert.match(route,/state:"PAIRED"/);
 assert.match(route,/state:"APPROVED"/);
 assert.match(route,/Screen listing is not a reservation or availability guarantee/);
 const start=route.indexOf('router.get("/inventory/screens"');
 const end=route.indexOf('router.get("/screens"',start);
 const section=route.slice(start,end);
 assert.doesNotMatch(section,/driverUserId|credential|installationReference|registrationTokenHash/);
 assert.equal(allowedApiPath(["inventory","screens"],"GET"),true);
 assert.equal(allowedApiPath(["webhooks","cashfree","payments"],"POST"),false);
});
