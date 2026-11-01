// Visual regression and accessibility check for /design-system.
//
// Usage (against a running production build):
//   BASE_URL=http://127.0.0.1:3000 npm run test:visual            compare with baselines
//   BASE_URL=http://127.0.0.1:3000 npm run test:visual -- --update  write new baselines
//
// Baselines live in tests/visual/baselines. Font rendering differs between
// operating systems, so compare only against baselines captured on the same
// platform (they were captured on Linux with Playwright's Chromium).
// Set PW_CHROMIUM_PATH to use a specific Chromium binary.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";
const UPDATE = process.argv.includes("--update");
const DIR = path.join(process.cwd(), "tests/visual/baselines");
const OUT = path.join(process.cwd(), "test-results/visual");
const WIDTHS = [390, 1440];
// Fraction of pixels allowed to differ (anti-aliasing noise), per channel tolerance.
const MAX_DIFF_RATIO = 0.002;
const CHANNEL_TOLERANCE = 24;

const browser = await chromium.launch(
  process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
);
const context = await browser.newContext({ reducedMotion: "reduce", deviceScaleFactor: 1 });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e.message)));

async function axe(label) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = result.violations.filter((v) => ["serious", "critical"].includes(v.impact));
  console.log(
    `axe ${label}: ${result.violations.length} violations (${serious.length} serious/critical)`,
  );
  for (const v of result.violations) console.log(`  - [${v.impact}] ${v.id}: ${v.nodes.length}`);
  return serious.length;
}

// Pixel comparison inside the browser, so no image library is needed.
async function diffRatio(a, b) {
  const p = await context.newPage();
  const ratio = await p.evaluate(
    async ({ a, b, tolerance }) => {
      const load = (src) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = "data:image/png;base64," + src;
        });
      const [x, y] = await Promise.all([load(a), load(b)]);
      if (x.width !== y.width || x.height !== y.height) return 1;
      const read = (img) => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, img.width, img.height).data;
      };
      const da = read(x);
      const db = read(y);
      let differing = 0;
      for (let i = 0; i < da.length; i += 4) {
        if (
          Math.abs(da[i] - db[i]) > tolerance ||
          Math.abs(da[i + 1] - db[i + 1]) > tolerance ||
          Math.abs(da[i + 2] - db[i + 2]) > tolerance
        )
          differing++;
      }
      return differing / (da.length / 4);
    },
    { a: a.toString("base64"), b: b.toString("base64"), tolerance: CHANNEL_TOLERANCE },
  );
  await p.close();
  return ratio;
}

let failures = 0;
fs.mkdirSync(DIR, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(BASE + "/design-system", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
failures += await axe("page");

await page.getByRole("button", { name: "Reject creative" }).first().click();
await page.getByRole("dialog").waitFor();
failures += await axe("dialog open");
await page.keyboard.press("Escape");
await page.getByRole("dialog").waitFor({ state: "detached" });
await page.waitForTimeout(100);
const focusReturned = await page.evaluate(() =>
  (document.activeElement?.textContent ?? "").trim().slice(0, 80),
);
if (focusReturned !== "Reject creative") {
  console.log("FAIL focus did not return to the dialog trigger:", focusReturned);
  failures++;
}
await page.getByRole("button", { name: "View campaign details" }).click();
await page.getByRole("dialog").waitFor();
failures += await axe("drawer open");
await page.keyboard.press("Escape");

for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 900 });
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  if (overflow) {
    console.log(`FAIL horizontal overflow at ${width}px`);
    failures++;
  }
  const shot = await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });
  const file = path.join(DIR, `design-system-${width}.png`);
  if (UPDATE || !fs.existsSync(file)) {
    fs.writeFileSync(file, shot);
    console.log(`baseline written: ${path.relative(process.cwd(), file)}`);
    continue;
  }
  const ratio = await diffRatio(fs.readFileSync(file), shot);
  const ok = ratio <= MAX_DIFF_RATIO;
  console.log(`${ok ? "ok  " : "FAIL"} ${width}px: ${(ratio * 100).toFixed(3)}% pixels differ`);
  if (!ok) {
    fs.writeFileSync(path.join(OUT, `design-system-${width}-actual.png`), shot);
    failures++;
  }
}

if (consoleErrors.length) {
  console.log("FAIL console errors:", consoleErrors);
  failures++;
}
await browser.close();
console.log(
  failures ? `\n${failures} check(s) failed` : "\nAll visual and accessibility checks passed",
);
process.exit(failures ? 1 : 0);
