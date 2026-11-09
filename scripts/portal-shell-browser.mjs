// M3 shared portal shell: per-role browser checks with intercepted backend responses.
// Proves the shell keeps the portals' session, role and sign-out behaviour.
//
//   BASE_URL=http://127.0.0.1:3101 npm run test:portal-shell
//
// Set PW_CHROMIUM_PATH to use a specific Chromium binary.
import assert from "node:assert/strict";
import {launchBrowser} from "./browser-engine.mjs";
import {saveBrowserEvidence} from "./browser-evidence.mjs";
import { AxeBuilder } from "@axe-core/playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3101";
const uid = "11111111-1111-4111-8111-111111111111";
const csrf = "c".repeat(64);

const roles = {
  advertiser: {
    portal: "Advertiser portal",
    gateTitle: "Secure advertiser access",
    signIn: "Sign in",
    wrongRoleMessage: "This account cannot access the advertiser portal.",
    navCount: 11,
    rootTitle: "Dashboard",
    next: { label: "My campaigns", href: "/advertiser/campaigns" },
  },
  driver: {
    portal: "Driver partner portal",
    gateTitle: "Live session required",
    signIn: "Secure sign in",
    wrongRoleMessage: "Your authenticated account does not have access to the driver portal.",
    navCount: 14,
    rootTitle: "Today",
    next: { label: "Earnings", href: "/driver/earnings" },
  },
  admin: {
    portal: "Admin portal",
    gateTitle: "Secure Admin access",
    signIn: "Sign in with Admin MFA",
    wrongRoleMessage: "This account has no Admin permission.",
    navCount: 18,
    rootTitle: "Dashboard",
    next: { label: "Users and roles", href: "/admin/users" },
  },
};

const browser=await launchBrowser();

/** A context whose backend answers as `sessionRole` (null = signed out). */
async function portalContext(sessionRole, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport });
  const state = { sessionRole, requests: [], logout: null };
  await context.route("**/api/backend/**", async (route) => {
    const r = route.request();
    const path = new URL(r.url()).pathname.replace("/api/backend", "");
    const method = r.method();
    state.requests.push(method + " " + path);
    const json = (status, data) =>
      route.fulfill({
        status,
        contentType: "application/json",
        headers: { "cache-control": "no-store" },
        body: JSON.stringify({ data }),
      });
    const failed = (status, code) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({ error: { code, message: code } }),
      });
    if (path === "/auth/session") {
      if (!state.sessionRole) return failed(401, "UNAUTHENTICATED");
      return json(200, {
        userId: uid,
        role: state.sessionRole,
        csrfToken: csrf,
        expiresAt: "2028-01-01T00:00:00Z",
      });
    }
    if (!state.sessionRole) return failed(401, "UNAUTHENTICATED");
    if (path === "/auth/logout" && method === "POST") {
      state.logout = { csrf: r.headers()["x-csrf-token"] };
      state.sessionRole = null;
      return json(200, {});
    }
    if (path === "/businesses") return json(200, [{ id: uid, displayName: "Business Example" }]);
    if (path === "/admin/reports")
      return json(200, {
        period: { from: "2026-10-01", to: "2026-10-31", timezone: "UTC" },
        counts: { newUsers: 1 },
        financial: {},
        currency: "INR",
      });
    if (path === "/drivers/me") return json(200, { id: uid, displayName: "Driver Example" });
    return json(200, []);
  });
  const page = await context.newPage();
  return { context, page, state };
}

async function noOverflow(page, label) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  assert.equal(overflow, false, "horizontal overflow: " + label);
}

async function axeClean(page, label) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = result.violations.filter((v) => ["serious", "critical"].includes(v.impact));
  await saveBrowserEvidence(page, label, { violations: result.violations });
  assert.deepEqual(
    serious.map((v) => v.id),
    [],
    "axe serious/critical on " + label,
  );
}

let checks = 0;
const pass = (msg) => {
  checks++;
  console.log("ok   " + msg);
};

try {
  for (const [role, expect] of Object.entries(roles)) {
    const root = "/" + role;

    // 1. Signed out: gate, sign-in link with return path, no portal chrome.
    {
      const { context, page } = await portalContext(null);
      await page.goto(BASE + root);
      await page.getByRole("heading", { level: 1, name: expect.gateTitle }).waitFor();
      const link = page.getByRole("link", { name: expect.signIn });
      assert.equal(await link.getAttribute("href"), "/login?next=" + encodeURIComponent(root));
      assert.equal(await page.getByRole("navigation", { name: expect.portal }).count(), 0);
      assert.equal(await page.getByRole("button", { name: "Sign out" }).count(), 0);
      await axeClean(page, role + " gate");
      await context.close();
      pass(`${role}: signed-out visitor sees "${expect.gateTitle}" and no portal`);
    }

    // 2. Wrong role: gate with the portal's own message, no portal chrome.
    {
      const other = role === "admin" ? "advertiser" : "admin";
      const { context, page } = await portalContext(other);
      await page.goto(BASE + root);
      await page.getByRole("heading", { level: 1, name: expect.gateTitle }).waitFor();
      await page.getByRole("alert").filter({ hasText: expect.wrongRoleMessage }).waitFor();
      assert.equal(await page.getByRole("navigation", { name: expect.portal }).count(), 0);
      await context.close();
      pass(`${role}: ${other} session is refused with "${expect.wrongRoleMessage}"`);
    }

    // 3. Correct role on desktop: shell, navigation, current page, title, breadcrumbs.
    {
      const { context, page, state } = await portalContext(role);
      await page.goto(BASE + root);
      const nav = page.getByRole("navigation", { name: expect.portal });
      await nav.waitFor();
      assert.equal(await nav.getByRole("link").count(), expect.navCount, "nav link count");
      const current = nav.locator('[aria-current="page"]');
      assert.equal(await current.count(), 1);
      assert.equal(await current.getAttribute("href"), root);
      await page.getByRole("heading", { level: 1, name: expect.rootTitle }).waitFor();
      if (role === "driver") {
        const driverShell = page.locator(".bma-driver-portal");
        assert.equal(await driverShell.count(), 1, "Driver theme attached to portal root");
        const hero = page.locator(".bma-driver-dashboard-hero");
        await hero.waitFor();
        assert.equal(await hero.locator("img").getAttribute("src"), "/images/hero/234.png",
          "Driver hero uses uploaded BlinkMyAd vehicle artwork");
        assert.equal(await page.locator(".bma-driver-sidebar-promo").count(), 1,
          "Driver sidebar includes an onboarding shortcut");
        assert.ok(await page.locator(".bma-driver-panel").count() >= 2,
          "Driver content uses redesigned shared panels");
      }

      await page.getByRole("navigation", { name: "Breadcrumb" }).waitFor();
      assert.equal(
        await page
          .getByRole("link", { name: "Notifications", exact: true })
          .first()
          .getAttribute("href"),
        root + "/notifications",
      );
      await noOverflow(page, role + " 1440");
      await axeClean(page, role + " home");

      await nav.getByRole("link", { name: expect.next.label }).click();
      await page.waitForURL("**" + expect.next.href);
      await page.getByRole("heading", { level: 1, name: expect.next.label }).waitFor();
      assert.equal(
        await nav.locator('[aria-current="page"]').getAttribute("href"),
        expect.next.href,
      );
      pass(`${role}: shell renders ${expect.navCount} links, current page, title and breadcrumbs`);

      // 4. Session revalidation when the tab becomes visible still signs the user out.
      state.sessionRole = null;
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await page.getByRole("heading", { level: 1, name: expect.gateTitle }).waitFor();
      assert.equal(await page.getByRole("navigation", { name: expect.portal }).count(), 0);
      await context.close();
      pass(`${role}: expired session on tab focus returns to the gate`);
    }

    // 5. Sign out sends the CSRF token and redirects to /login.
    {
      const { context, page, state } = await portalContext(role);
      await page.goto(BASE + root);
      await page.getByRole("button", { name: "Sign out" }).click();
      await page.waitForURL("**/login");
      assert.equal(state.logout?.csrf, csrf, "logout carries CSRF token");
      await context.close();
      pass(`${role}: sign out posts /auth/logout with CSRF and redirects to /login`);
    }

    // 6. Mobile: menu dialog opens, traps focus, closes on Escape and on navigation.
    {
      const { context, page } = await portalContext(role, { width: 390, height: 844 });
      await page.goto(BASE + root);
      const menu = page.getByRole("button", { name: "Open menu" });
      await menu.waitFor();
      assert.equal(await page.getByRole("navigation", { name: expect.portal }).count(), 0);
      await noOverflow(page, role + " 390");
      await menu.click();
      const dialog = page.getByRole("dialog", { name: expect.portal + " menu" });
      await dialog.waitFor();
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "detached" });
      await page.waitForTimeout(100);
      assert.equal(
        await page.evaluate(() => document.activeElement?.getAttribute("aria-label")),
        "Open menu",
        "focus returns to the menu button",
      );
      await menu.click();
      await dialog.getByRole("link", { name: expect.next.label }).click();
      await page.waitForURL("**" + expect.next.href);
      await dialog.waitFor({ state: "detached" });
      await context.close();
      pass(
        `${role}: mobile menu opens, closes on Escape with focus restored, closes on navigation`,
      );
    }
  }
  console.log(`\nPortal shell browser checks passed: ${checks}`);
} finally {
  await browser.close();
}
