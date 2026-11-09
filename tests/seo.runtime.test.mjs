import assert from "node:assert/strict";
import test from "node:test";
import { siteOrigin } from "../src/services/site-origin.mjs";
import { publicMetadata } from "../src/config/public-metadata.ts";
import sitemapModule from "../src/app/sitemap.ts";
import robotsModule from "../src/app/robots.ts";

const sitemap=sitemapModule.default ?? sitemapModule;
const robots=robotsModule.default ?? robotsModule;

test("canonical origin rejects credentials, paths and insecure URLs", () => {
  for(const value of [undefined,"", "http://site.invalid","https://a:b@site.invalid","https://site.invalid/path","https://site.invalid?key=private","https://site.invalid#fragment","https://localhost"])
    assert.equal(siteOrigin(value),null);
  assert.equal(siteOrigin("https://site.invalid/"),"https://site.invalid");
});
test("indexing stays gated; private and pending legal pages remain excluded", () => {
  const app=process.env.NEXT_PUBLIC_APP_URL,index=process.env.SITE_INDEXING_ENABLED;
  try{
    process.env.NEXT_PUBLIC_APP_URL="https://owned.example.invalid";
    process.env.SITE_INDEXING_ENABLED="false";
    assert.deepEqual(sitemap(),[]);
    assert.equal(publicMetadata("/locations","Locations","Published areas").robots.index,false);
    assert.deepEqual(robots().rules,[{userAgent:"*",disallow:"/"}]);
    process.env.SITE_INDEXING_ENABLED="true";
    assert.equal(sitemap().length,10);
    assert.ok(sitemap().some(x=>new URL(x.url).pathname==="/how-it-works"));
    assert.equal(sitemap().some(x=>/admin|advertiser\/|driver\/|privacy|terms/.test(new URL(x.url).pathname)),false);
    assert.equal(publicMetadata("/locations","Locations","Published areas").alternates.canonical,"https://owned.example.invalid/locations");
    assert.equal(publicMetadata("/privacy","Privacy","Pending").robots.index,false);
    assert.ok(robots().rules[0].disallow.includes("/admin"));
    process.env.NEXT_PUBLIC_APP_URL="https://user:secret@owned.example.invalid";
    assert.deepEqual(sitemap(),[]);
    assert.equal(publicMetadata("/","Home","Home").robots.index,false);
    assert.deepEqual(robots().rules,[{userAgent:"*",disallow:"/"}]);
  }finally{
    if(app===undefined)delete process.env.NEXT_PUBLIC_APP_URL;else process.env.NEXT_PUBLIC_APP_URL=app;
    if(index===undefined)delete process.env.SITE_INDEXING_ENABLED;else process.env.SITE_INDEXING_ENABLED=index;
  }
});
