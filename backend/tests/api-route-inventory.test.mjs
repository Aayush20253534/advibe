/* global URL */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { enumerateApiRoutes, isExternalProviderRoute, isPublicReadRoute } from "./route-inventory.mjs";

test("every Express endpoint is discoverable, unique and included in boundary probing", () => {
  const routes = enumerateApiRoutes();
  assert.ok(routes.length >= 115, "API route inventory unexpectedly shrank");
  const signatures = routes.map(item => item.method + " " + item.path);
  assert.equal(new Set(signatures).size, signatures.length, "duplicate method/path declaration");
  for (const route of routes) {
    assert.match(route.path, /^\/api\/v1\/[A-Za-z0-9/:_-]+$/);
    assert.match(route.method, /^(GET|POST|PATCH|PUT|DELETE)$/);
  }
  const files = new Set(routes.map(item => item.file.split("/")[0]));
  for (const required of ["auth", "accounts", "drivers", "kyc", "devices", "geo",
    "creatives", "pricing", "campaigns", "reservations", "payments", "delivery",
    "telemetry", "earnings", "finance", "support", "admin"]) {
    assert.ok(files.has(required), "missing required API module: " + required);
    const testFile = required === "accounts" ? "accounts.integration.test.ts" :
      required === "geo" ? "geo.integration.test.ts" :
      required === "admin" ? "admin.integration.test.ts" :
      required === "auth" ? "auth.integration.test.ts" :
      required === "payments" ? "payments.integration.test.ts" :
      required === "reservations" ? "reservations.integration.test.ts" :
      required + ".integration.test.ts";
    assert.ok(existsSync(fileURLToPath(new URL("./" + testFile, import.meta.url))),
      "missing module integration suite: " + testFile);
  }
  const firstParty = routes.filter(route => !isExternalProviderRoute(route));
  assert.ok(firstParty.length > 95, "provider-independent route surface unexpectedly shrank");
  assert.ok(firstParty.some(isPublicReadRoute));
  assert.ok(firstParty.some(route => route.path === "/api/v1/admin/audit-events"));
  assert.ok(firstParty.some(route => route.path === "/api/v1/notifications"));
  assert.ok(firstParty.some(route => route.path === "/api/v1/campaigns/:campaignId/submit"));
});
