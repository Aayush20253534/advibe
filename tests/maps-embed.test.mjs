import assert from "node:assert/strict";
import test from "node:test";
import { mapsEmbedUrl } from "../src/services/maps-embed.mjs";

test("maps stay unavailable without configuration or valid numeric coordinates", () => {
  for (const args of [[undefined,25,81],["",25,81],["key",NaN,81],["key",25,Infinity],["key",91,0],["key",0,-181],["key","25",81]]) {
    assert.equal(mapsEmbedUrl(...args), null);
  }
});
test("map URL uses only the official embed view and safely encoded public key", () => {
  const url = new URL(mapsEmbedUrl("key&redirect=https://bad.invalid",25.4358,81.8463));
  assert.equal(url.origin,"https://www.google.com");
  assert.equal(url.pathname,"/maps/embed/v1/view");
  assert.equal(url.searchParams.get("center"),"25.4358,81.8463");
  assert.equal(url.searchParams.get("key"),"key&redirect=https://bad.invalid");
  assert.equal(url.searchParams.has("redirect"),false);
  assert.equal(url.searchParams.get("zoom"),"14");
});
