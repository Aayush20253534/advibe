import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("driver screens share scoped responsive design and do not alter admin or advertiser",()=>{
 const layout=read("src/app/(portals)/driver/layout.tsx");
 const shell=read("src/components/portal/portal-shell.tsx");
 const theme=read("src/features/driver-live/driver-theme.css");
 const common=read("src/features/driver-live/common.tsx");
 const today=read("src/features/driver-live/screens.tsx");
 const portal=read("src/features/live/api-portal.tsx");
 assert.match(layout,/driver-theme\.css/);
 assert.match(shell,/role==="driver"&&"bma-driver-portal"/);
 assert.match(shell,/bma-driver-page-header/);
 assert.match(shell,/bma-driver-sidebar-promo/);
 assert.match(theme,/\.bma-driver-portal/);
 assert.match(theme,/@media\(max-width:750px\)/);
 assert.match(theme,/@media\(max-width:490px\)/);
 assert.match(common,/bma-driver-panel/);
 assert.match(today,/bma-driver-dashboard-hero/);
 assert.match(today,/\/images\/hero\/234\.png/);
 assert.match(portal,/current\.role!==role/);
 for (const section of ["onboarding","verification","vehicle","assigned-ads","campaigns","earnings","payouts","delivery","trips","maintenance","notifications","support","profile"]) {
   assert.ok(portal.includes(section+':"')||read("src/config/navigation.ts").includes("/driver/"+section),"Missing driver workflow: "+section);
 }
});
test("driver dashboard displays only backend data and honest availability language",()=>{
 const today=read("src/features/driver-live/screens.tsx");
 assert.match(today,/useDriverResource<DriverProfile>/);
 assert.match(today,/useDriverResource<Earnings>/);
 assert.match(today,/isn&apos;t available yet/);
 assert.match(today,/availablePaise/);
});
