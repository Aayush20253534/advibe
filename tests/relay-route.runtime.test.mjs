import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { GET, POST } from "../src/app/api/backend/[...path]/route.ts";

const params={params:Promise.resolve({path:["auth","session"]})};
test("relay route enforces streamed limits, cookie isolation and correlation", async () => {
  const originalFetch=globalThis.fetch,originalOrigin=process.env.ADVIBE_BACKEND_ORIGIN;
  process.env.ADVIBE_BACKEND_ORIGIN="https://owned-api.example.invalid";
  let calls=0;
  try {
    globalThis.fetch=async (_url,init) => {
      calls++;
      assert.equal(init.headers.get("cookie"),"advibe_dev_session=session");
      return new Response('{"data":{}}',{headers:{"Content-Type":"application/json","X-Request-ID":"e01aa7e1-bd88-4b6f-a9c0-547a545550c1","Retry-After":"60","Set-Cookie":"unrelated_cookie=blocked"}});
    };
    const response=await GET(new NextRequest("https://app.example.invalid/api/backend/auth/session",{headers:{Cookie:"tracking=private; advibe_dev_session=session"}}),params);
    assert.equal(response.status,200);
    assert.equal(response.headers.get("x-request-id"),"e01aa7e1-bd88-4b6f-a9c0-547a545550c1");
    assert.equal(response.headers.get("retry-after"),"60");
    assert.equal(response.headers.get("set-cookie"),null);
    const badOrigin=await POST(new NextRequest("https://app.example.invalid/api/backend/auth/login",{method:"POST",headers:{Origin:"https://other.invalid","Content-Type":"application/json"},body:"{}"}),{params:Promise.resolve({path:["auth","login"]})});
    assert.equal(badOrigin.status,403);
    const oversized=await POST(new NextRequest("https://app.example.invalid/api/backend/auth/login",{method:"POST",headers:{Origin:"https://app.example.invalid","Content-Type":"application/json"},body:'"'+"x".repeat(65536)+'"'}),{params:Promise.resolve({path:["auth","login"]})});
    assert.equal(oversized.status,413);
    assert.equal(calls,1);
    globalThis.fetch=async () => new Response(new Uint8Array(2_000_001),{headers:{"Content-Type":"application/json"}});
    const tooLarge=await GET(new NextRequest("https://app.example.invalid/api/backend/auth/session"),params);
    assert.equal(tooLarge.status,502);
    assert.equal((await tooLarge.json()).error.code,"UPSTREAM_RESPONSE_TOO_LARGE");
  } finally {
    globalThis.fetch=originalFetch;
    if(originalOrigin===undefined)delete process.env.ADVIBE_BACKEND_ORIGIN;
    else process.env.ADVIBE_BACKEND_ORIGIN=originalOrigin;
  }
});
