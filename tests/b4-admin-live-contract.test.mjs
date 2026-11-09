import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {allowedApiPath} from "../src/services/api-route-policy.mjs";
const read=path=>fs.readFileSync(path,"utf8");
test("Admin uses authenticated dedicated API portal with no demo fallback",()=>{
 const layout=read("src/app/(portals)/0000BMA0/admin/layout.tsx");
 // Routing proposal (docs/redesign/ROUTING_PROPOSAL.md): the layout wraps each live Admin page.
 assert.match(layout,/<AdminPortal>\{children\}<\/AdminPortal>/);
 assert.doesNotMatch(layout,/PortalGate|demo-auth|ApiPortal/);
 const portal=read("src/features/admin-live/portal.tsx");
 assert.match(portal,/liveSession\(\)/);
 assert.match(portal,/user\.role!=="admin"/);
 assert.match(portal,/AdminContext\.Provider/);
 assert.match(portal,/visibilitychange/);
 for(const file of ["common.tsx","portal.tsx","reviews.tsx","operations.tsx","catalog.tsx"]){
  const text=read("src/features/admin-live/"+file);
  assert.doesNotMatch(text,/demo-auth|useDemoStore|DEMO_USERS|localStorage|sessionStorage/);
 }
});
test("Sensitive Admin mutations remain CSRF-guarded, revision-aware and provider-gated",()=>{
 const common=read("src/features/admin-live/common.tsx");
 assert.match(common,/csrfToken:session\.csrfToken/);
 assert.match(common,/idempotencyKey:newIdempotencyKey\(\)/);
 const reviews=read("src/features/admin-live/reviews.tsx");
 for(const endpoint of ["/admin/campaigns/","/admin/creatives/","/admin/driver-applications/","/admin/driver-documents/"])
  assert.ok(reviews.includes(endpoint),endpoint);
 assert.match(reviews,/expectedRevision:detail\.revision/);
 assert.match(reviews,/independent/);
 const ops=read("src/features/admin-live/operations.tsx");
 for(const route of ["/admin/users/","/support/tickets/","/admin/audit-events",
  "/admin/reports","/payments?limit=50","/notifications/"])
  assert.ok(ops.includes(route),route);
 assert.match(ops,/expectedStatus:selected\.status\.toUpperCase\(\)/);
 assert.match(ops,/expectedVersion:detail\.version/);
 assert.doesNotMatch(ops,/status:"SUCCESS"|status:"PAID"/);
});
test("Admin catalog uses genuine geographic and rate APIs",()=>{
 const code=read("src/features/admin-live/catalog.tsx");
 for(const route of ["/admin/cities","/admin/zones","/admin/locations","/screens?limit=100",
  "/admin/screens/","/pricing/rules","/admin/pricing/rules","/admin/pricing/tax-policies"])
  assert.ok(code.includes(route),route);
 assert.match(code,/expectedVersion:revision\.version/);
 const client=read("src/services/api-client.ts");
 assert.match(client,/\|"PUT"\|/);
});
test("Frontend bridge excludes device key and webhook mutations, permits sanitized read-only device status",()=>{
 const id="11111111-1111-4111-8111-111111111111";
 assert.equal(allowedApiPath(["admin","devices",id,"player-status"],"GET"),true);
 assert.equal(allowedApiPath(["admin","devices",id,"player-status"],"POST"),false);
 assert.equal(allowedApiPath(["admin","devices","screens"],"POST"),false);
 assert.equal(allowedApiPath(["devices","pair"],"POST"),false);
 assert.equal(allowedApiPath(["webhooks","cashfree","payments"],"POST"),false);
 assert.equal(allowedApiPath(["admin","reports","export"],"GET"),true);
});

test("All Admin routes use the premium portal theme without changing role or API boundaries",()=>{
 const layout=read("src/app/(portals)/0000BMA0/admin/layout.tsx");
 const shell=read("src/components/portal/portal-shell.tsx");
 const portal=read("src/features/admin-live/portal.tsx");
 const shared=read("src/features/admin-live/common.tsx");
 const dashboard=read("src/features/admin-live/operations.tsx");
 const theme=read("src/features/admin-live/admin-theme.css");
 const navigation=read("src/config/navigation.ts");
 assert.match(layout,/admin-theme\.css/);
 assert.match(shell,/bma-admin-portal/);
 assert.match(shell,/bma-admin-sidebar-mobile/);
 assert.match(shell,/bma-admin-page-header/);
 assert.match(shell,/Admin access active/);
 assert.doesNotMatch(shell,/MFA-protected session/);
 assert.match(portal,/AdminContext\.Provider/);
 assert.match(portal,/descriptions\[path\]/);
 assert.match(portal,/ADMIN_LOGIN/);
 for(const classname of ["bma-admin-card","bma-admin-table","bma-admin-field","bma-admin-primary","bma-admin-secondary"]){
  assert.ok(shared.includes(classname), classname+" is missing from Admin's shared components");
  assert.ok(theme.includes("."+classname),classname+" is missing from the Admin theme");
 }
 for(const classname of ["bma-admin-dashboard-hero","bma-admin-dashboard-metrics","bma-admin-shortcuts"]){
  assert.ok(dashboard.includes(classname),classname+" missing in data-backed dashboard");
  assert.ok(theme.includes("."+classname),classname+" missing from design system");
 }
 for(const route of ["campaigns","advertisers","drivers","screens","locations","ad-formats",
  "pricing","approvals","bookings","payments","settlements","analytics","users","audit",
  "notifications","support","settings"]){
  assert.ok(navigation.includes('"/0000BMA0/admin/'+route+'"'),route+" route missing from Admin navigation");
  assert.ok(portal.includes(route+':"')||portal.includes('"'+route+'":'),route+" missing from Admin page descriptions");
 }
 assert.match(dashboard,/api<Reports>\("\/admin\/reports"\)/);
 assert.doesNotMatch(dashboard,/localStorage|sessionStorage|DEMO_USERS/);
});
