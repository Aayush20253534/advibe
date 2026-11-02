import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/app/(site)/page.tsx", import.meta.url), "utf8");
const motion = readFileSync(new URL("../src/components/landing/home-motion.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../src/components/layout/public-shell.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/components/landing/homepage.css", import.meta.url), "utf8");

test("the long-scroll homepage preserves the approved sections and routes", () => {
  for (const name of ["Your brand", "Advertising that", "From idea to approved campaign", "Built for both sides", "Choose the screen", "Starting local", "Reviewed before it runs", "Take your brand"]) {
    assert.ok(page.includes(name), `missing section ${name}`);
  }
  for (const href of ["/signup?role=advertiser", "/for-drivers", "/for-advertisers", "/ad-formats", "/locations"]) {
    assert.ok(page.includes(href), `missing route ${href}`);
  }
});

test("hero and section images reference committed assets, with no fabricated national inventory", () => {
  for (const image of ["hero-city.webp", "hero-bike.png", "hero-auto.png", "hero-car.png", "hero-static.webp"]) {
    assert.ok(motion.includes(image), `missing hero asset ${image}`);
  }
  for (const image of ["advertisers.webp", "drivers.webp", "closing-road.webp", "bike-rear.webp", "auto-rear.webp", "car-interior.webp", "helmet.webp"]) {
    assert.ok(page.includes(image), `missing homepage asset ${image}`);
  }
  assert.match(page, /Starting in Prayagraj/);
  assert.match(motion, /do not indicate available services|not live service coverage/);
});

test("map is geographically grounded and scroll animated", () => {
  assert.match(motion, /const INDIA_OUTLINE =/);
  assert.match(motion, /cx="342\.1" cy="267\.3"/);
  assert.match(motion, /useInView/);
  assert.match(motion, /pathLength/);
  assert.match(motion, /Illustrative future network|Orange connections illustrate potential expansion/);
});

test("motions respect reduced-motion and keep static fallback", () => {
  assert.match(motion, /useReducedMotion/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /av-hero-still \{ display: block !important; \}/);
  assert.match(motion, /useScroll/);
});

test("shared navigation retains all public destinations and the portal links", () => {
  for (const href of ["/about", "/contact", "/help-center", "/terms", "/privacy", "/advertiser", "/driver", "/signup", "/login"]) {
    assert.ok(shell.includes(href), `missing public navigation destination ${href}`);
  }
  assert.match(shell, /trapOverlayTab/);
});
