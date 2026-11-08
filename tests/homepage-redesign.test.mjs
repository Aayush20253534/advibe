import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const page = read("src/app/(site)/page.tsx");
const motion = read("src/components/landing/brand-experience.tsx");
const shell = read("src/components/layout/public-shell.tsx");
const css = read("src/components/landing/homepage.css");
const homepageFooter = read("src/components/landing/homepage-chrome.tsx");

test("public narrative retains advertiser, partner, format and location routes", () => {
  for (const href of ["/signup?role=advertiser", "/for-drivers", "/for-advertisers", "/ad-formats", "/locations", "/help-center"]) assert.ok((page + homepageFooter).includes(href),href);
  assert.match(page,/Prayagraj pilot/);
  assert.match(page,/A focused city pilot/);
});
test("new brand and format artwork is committed and represented as illustrative", () => {
  for (const asset of ["fleet","auto","bike","interior","helmet","car-rear","auto-side"]) assert.ok(existsSync(new URL(`../public/images/blinkmyad/${asset}.webp`,import.meta.url)),asset);
  assert.match(page,/Illustrative concept/);
  assert.match(motion,/Illustrative concept/);
  assert.match(read("src/config/brand.ts"),/Blink My Ad Pvt Ltd/);
  assert.doesNotMatch(read("src/components/public/contact-enquiry.tsx"),/mailto:|support@advibe/);
});
test("format and campaign explainers expose their selected state and labelled content", () => {
  assert.match(motion,/aria-pressed=\{selected === index\}/);
  assert.match(motion,/aria-controls="format-stage"/);
  assert.match(motion,/aria-controls="campaign-explanation"/);
  assert.match(motion,/aria-live="polite"/);
  assert.doesNotMatch(motion,/setInterval/);
});
test("content is available without animation and respects reduced motion", () => {
  assert.match(motion,/prefers-reduced-motion: reduce/);
  assert.match(motion,/IntersectionObserver/);
  assert.match(motion,/observer.disconnect/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/\.bma-reveal\{opacity:1;transform:none\}/);
  assert.match(css,/focus-within\{opacity:1/);
});
test("navigation keeps public pages, portals and keyboard focus containment", () => {
  for (const href of ["/about", "/contact", "/help-center", "/terms", "/privacy", "/advertiser", "/driver", "/signup", "/login"]) assert.ok(shell.includes(href),href);
  assert.match(shell,/trapOverlayTab/);
  assert.match(shell,/inert=\{mobileOpen\}/);
});
