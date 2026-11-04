/* global URL, fetch, process */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import test from "node:test";
import { createApp } from "../src/app.ts";
import { loadConfig } from "../src/config/env.ts";
import { createLogger } from "../src/lib/logger.ts";
import { loadAuthSettings } from "../src/modules/auth/settings.ts";
import { encryptTotpSecret } from "../src/modules/auth/mfa.ts";
import { hashToken, mac, makeSessionToken } from "../src/modules/auth/security.ts";
import { enumerateApiRoutes, concretePath, isExternalProviderRoute, isPublicReadRoute } from "./route-inventory.mjs";

// Hard-stop before any fixtures or HTTP traffic if pointed at Neon/remote/shared storage.
const uri = process.env.DATABASE_URL;
if (process.env.NODE_ENV !== "test" || process.env.DB_TEST_ALLOWED !== "true" || !uri) {
  throw new Error("API boundary tests require NODE_ENV=test, DB_TEST_ALLOWED=true and disposable DB");
}
const database = new URL(uri);
if (!["localhost", "127.0.0.1", "::1"].includes(database.hostname) ||
  !/(^|[_-])(test|ci)([_-]|$)/.test(database.pathname.slice(1))) {
  throw new Error("Refusing to run API boundary tests against non-local/non-test DB");
}

test("every first-party endpoint rejects anonymous access or invalid mutations without 5xx", async t => {
  const db = new PrismaClient();
  await db.$connect();
  const config = loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" });
  const settings = loadAuthSettings({
    AUTH_SECRET: "ci_only_dev_test_auth_secret_32_characters_long_value",
    MFA_ENCRYPTION_KEY: "3f4e8bb1976542ac8ef51b03d9607a2acb8970645a1ed3c0b7d14982f63a0e57",
  }, config);
  const app = createApp(config, createLogger(config), async () => { await db.user.count(); },
    { db, settings, sender: async () => {} }, async () => false);
  const server = app.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const base = "http://127.0.0.1:" + server.address().port;
    const routes = enumerateApiRoutes().filter(route => !isExternalProviderRoute(route));
    for (const route of routes) {
      await t.test(route.method + " " + route.path, async () => {
        const isMutation = route.method !== "GET";
        const headers = { Origin: "http://localhost:3000", ...(isMutation ? { "Content-Type": "application/json" } : {}) };
        const response = await fetch(base + concretePath(route.path), {
          method: route.method, headers, ...(isMutation ? { body: "{}" } : {}),
          signal: AbortSignal.timeout(8000),
        });
        const status = response.status;
        if (isPublicReadRoute(route)) {
          assert.equal(status, 200, "public/system read failed: " + route.path);
        } else if (isMutation) {
          assert.ok([400, 401, 403, 415, 422].includes(status),
            route.method + " " + route.path + " should reject anonymous/invalid mutation, got " + status);
        } else {
          assert.equal(status, 401, "protected read must require authentication: " + route.path);
        }
        assert.ok(response.headers.has("x-request-id"), "missing request ID on " + route.path);
        assert.equal(response.headers.get("x-powered-by"), null);
      });
    }

    // Positive and negative role checks use real PostgreSQL-backed server sessions.
    const uid = randomUUID().slice(0, 10);
    const passwordHash = await argon2.hash("ApiSurfaceStrongPassword!2026", { type: argon2.argon2id });
    const identities = {};
    for (const role of ["ADMIN", "ADVERTISER", "DRIVER"]) {
      const user = await db.user.create({ data: {
        email: "api-surface-" + role.toLowerCase() + "-" + uid + "@example.invalid",
        displayName: "API Surface " + role, role, status: "ACTIVE",
        emailVerifiedAt: new Date(), passwordHash,
      } });
      if (role === "ADMIN") await db.adminMfaCredential.create({ data: {
        userId: user.id, secretCipher: encryptTotpSecret(settings, user.id,
          "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"), enabledAt: new Date(Date.now() - 60000),
      } });
      const token = makeSessionToken();
      const tokenHash = hashToken(token);
      await db.session.create({ data: {
        userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 600000),
        ...(role === "ADMIN" ? { mfaVerifiedAt: new Date() } : {}),
      } });
      identities[role] = {
        Cookie: "advibe_dev_session=" + token,
        csrf: mac(settings, "csrf", tokenHash),
      };
    }
    const matrix = [
      { path: "/api/v1/auth/session", roles: ["ADMIN", "ADVERTISER", "DRIVER"] },
      { path: "/api/v1/me", roles: ["ADMIN", "ADVERTISER", "DRIVER"] },
      { path: "/api/v1/drivers/me", roles: ["DRIVER"] },
      { path: "/api/v1/drivers/applications", roles: ["DRIVER"] },
      { path: "/api/v1/drivers/me/vehicles", roles: ["DRIVER"] },
      { path: "/api/v1/admin/users", roles: ["ADMIN"] },
      { path: "/api/v1/admin/locations", roles: ["ADMIN"] },
      { path: "/api/v1/admin/pricing/tax-policies", roles: ["ADMIN"] },
      { path: "/api/v1/admin/audit-events", roles: ["ADMIN"] },
      { path: "/api/v1/pricing/rules", roles: ["ADMIN"] },
    ];
    for (const item of matrix) for (const role of ["ADMIN", "ADVERTISER", "DRIVER"]) {
      await t.test("role " + role + " GET " + item.path, async () => {
        const response = await fetch(base + item.path, {
          headers: { Cookie: identities[role].Cookie },
          signal: AbortSignal.timeout(8000),
        });
        assert.equal(response.status, item.roles.includes(role) ? 200 : 403,
          role + " access mismatch for " + item.path);
      });
    }
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await db.$disconnect();
  }
});
