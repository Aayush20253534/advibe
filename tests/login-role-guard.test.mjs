import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {matchesRequestedLoginRole} from "../src/services/login-role-guard.mjs";

const encoded = role => new TextEncoder().encode(JSON.stringify({data:{userId:"a",role,csrfToken:"test"}}));

test("advertiser cannot authenticate through Driver Partner selection",()=>{
 assert.equal(matchesRequestedLoginRole("driver",201,encoded("advertiser")),false);
 assert.equal(matchesRequestedLoginRole("advertiser",201,encoded("driver")),false);
});
test("matching driver and advertiser roles pass; Admin MFA remains compatible",()=>{
 assert.equal(matchesRequestedLoginRole("driver",201,encoded("driver")),true);
 assert.equal(matchesRequestedLoginRole("advertiser",201,encoded("advertiser")),true);
 assert.equal(matchesRequestedLoginRole(null,202,encoded("admin")),true);
 assert.equal(matchesRequestedLoginRole(null,201,encoded("admin")),true);
});
test("missing or unreadable role on successful login fails closed",()=>{
 assert.equal(matchesRequestedLoginRole("driver",201,new TextEncoder().encode('{"data":{}}')),false);
 assert.equal(matchesRequestedLoginRole("driver",201,new TextEncoder().encode("bad")),false);
 assert.equal(matchesRequestedLoginRole("driver",403,encoded("advertiser")),true);
});
test("relay checks authoritative response before forwarding any login cookies",()=>{
 const route=readFileSync(new URL("../src/app/api/backend/[...path]/route.ts",import.meta.url),"utf8");
 assert.ok(route.indexOf("matchesRequestedLoginRole(requestedLoginRole")>0);
 assert.ok(route.indexOf("matchesRequestedLoginRole(requestedLoginRole")<route.indexOf("new NextResponse(bytes"));
 assert.ok(route.indexOf("matchesRequestedLoginRole(requestedLoginRole")<route.indexOf('for(const cookie of upstream.headers.getSetCookie()'));
 assert.match(route,/ACCOUNT_ROLE_MISMATCH/);
});
