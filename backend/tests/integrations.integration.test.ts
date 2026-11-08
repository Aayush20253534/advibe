import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config/env.js";
import { createLogger } from "../src/lib/logger.js";
import { loadAuthSettings } from "../src/modules/auth/settings.js";
import { encryptTotpSecret } from "../src/modules/auth/mfa.js";
import { makeSessionToken, hashToken, mac } from "../src/modules/auth/security.js";

const url = new URL(process.env.DATABASE_URL ?? "http://invalid");
if (process.env.NODE_ENV !== "test" || process.env.DB_TEST_ALLOWED !== "true" ||
    !["localhost", "127.0.0.1", "::1"].includes(url.hostname) ||
    !/(^|[_-])(test|ci)([_-]|$)/.test(url.pathname.slice(1)))
  throw new Error("Provider integration tests require disposable local PostgreSQL");

test("disabled provider routes preserve auth, reject injected providers and create no business records", async () => {
  const db = new PrismaClient();
  const config = loadConfig({ NODE_ENV: "test", LOG_LEVEL: "silent" });
  const settings = loadAuthSettings({ AUTH_SECRET: "ci_only_dev_test_auth_secret_32_characters_long_value",
    MFA_ENCRYPTION_KEY: "3f4e8bb1976542ac8ef51b03d9607a2acb8970645a1ed3c0b7d14982f63a0e57" }, config);
  await db.$connect();
  const passwordHash = await argon2.hash("Optional-Providers-Test-Password-2026!", { type: argon2.argon2id });
  const identities: Record<string, { cookie: string; csrf: string }> = {};
  for (const role of ["ADVERTISER", "DRIVER", "ADMIN"] as const) {
    const user = await db.user.create({ data: { email: "flags-" + randomUUID() + "@example.invalid",
      displayName: "Flag test", role, status: "ACTIVE", emailVerifiedAt: new Date(), passwordHash } });
    if (role === "ADMIN") await db.adminMfaCredential.create({ data: { userId: user.id,
      secretCipher: encryptTotpSecret(settings, user.id, "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"),
      enabledAt: new Date(Date.now() - 60000) } });
    const token = makeSessionToken();
    await db.session.create({ data: { userId: user.id, tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 600000), ...(role === "ADMIN" ? { mfaVerifiedAt: new Date() } : {}) } });
    identities[role] = { cookie: "advibe_dev_session=" + token, csrf: mac(settings, "csrf", hashToken(token)) };
  }
  let calls = 0;
  const blocked = async (): Promise<never> => { calls++; throw new Error("Disabled provider was invoked"); };
  const app = createApp(config, createLogger(config), async () => { await db.user.count(); },
    { db, settings, sender: async () => {} }, async () => false,
    { storage: { presignPut: blocked, head: blocked, presignGet: blocked } },
    { storage: { signedPut: blocked, head: blocked, readVersion: blocked, writeProcessed: blocked, signedGet: blocked } },
    { gateway: { createOrder: blocked, getOrder: blocked, getPayment: blocked, listPayments: blocked }, webhookSecret: "leftover-webhook-secret" },
    undefined,
    { gateway: { verifyBeneficiary: blocked, createTransfer: blocked, getTransfer: blocked }, webhookSecret: "leftover-webhook-secret" },
    { gateway: { createRefund: blocked, getRefund: blocked, getOrder: blocked, listPayments: blocked } });
  const server = app.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const base = "http://127.0.0.1:" + (server.address() as AddressInfo).port + "/api/v1";
    const snapshot = () => Promise.all([db.driverDocument.count(), db.mediaAsset.count(), db.paymentOrder.count(),
      db.driverPayout.count(), db.payoutBeneficiary.count(), db.paymentRefund.count(), db.outboxEvent.count()]);
    const before = await snapshot();
    const id = randomUUID();
    const cases: Array<[string, string, string, object | undefined, string]> = [
      ["POST", "/creatives/upload-intents", "ADVERTISER", { businessId: id, contentType: "image/png", sizeBytes: 32, sha256: "a".repeat(64) }, "CLOUD_STORAGE_DISABLED"],
      ["POST", "/creatives/assets/" + id + "/complete", "ADVERTISER", {}, "CLOUD_STORAGE_DISABLED"],
      ["GET", "/admin/creatives/" + id + "/preview-url", "ADMIN", undefined, "CLOUD_STORAGE_DISABLED"],
      ["POST", "/drivers/documents/upload-intents", "DRIVER", { applicationId: id, kind: "licence", contentType: "image/png", sizeBytes: 32 }, "CLOUD_STORAGE_DISABLED"],
      ["POST", "/drivers/documents/" + id + "/complete", "DRIVER", {}, "CLOUD_STORAGE_DISABLED"],
      ["GET", "/admin/driver-documents/" + id + "/download-url", "ADMIN", undefined, "CLOUD_STORAGE_DISABLED"],
      ["POST", "/webhooks/kyc/document-scan", "", { eventId: "scan-test-123", documentId: id, verdict: "clean", sha256: "a".repeat(64), versionId: "v1", timestamp: Date.now() }, "CLOUD_STORAGE_DISABLED"],
      ["POST", "/payments/orders", "ADVERTISER", { campaignId: id, quoteId: id, reservationHoldId: id, customerPhone: "9999999999" }, "CASHFREE_DISABLED"],
      ["POST", "/reservations/holds/" + id + "/confirm", "ADVERTISER", {}, "CASHFREE_DISABLED"],
      ["POST", "/admin/refunds", "ADMIN", { paymentOrderId: id, amountPaise: 100, reason: "Synthetic test refund reason", policyReference: "test-policy" }, "CASHFREE_DISABLED"],
      ["POST", "/admin/finance/reconcile/" + id, "ADMIN", {}, "CASHFREE_DISABLED"],
      ["POST", "/drivers/me/beneficiaries", "DRIVER", { providerToken: "synthetic-token-123" }, "CASHFREE_DISABLED"],
      ["POST", "/admin/payouts", "ADMIN", { settlementId: id, beneficiaryId: id }, "CASHFREE_DISABLED"],
      ["POST", "/webhooks/cashfree/payments", "", {}, "CASHFREE_DISABLED"],
      ["POST", "/webhooks/cashfree/payouts", "", {}, "CASHFREE_DISABLED"],
    ];
    for (const [method, path, role, body, code] of cases) {
      const who = identities[role];
      const response = await fetch(base + path, { method, headers: { "Content-Type": "application/json",
        Origin: "http://localhost:3000", "Idempotency-Key": "disabled-" + randomUUID(),
        ...(who ? { Cookie: who.cookie, "X-CSRF-Token": who.csrf } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}) });
      const payload = await response.json() as { error: { code: string } };
      assert.equal(response.status, 503, method + " " + path + " " + JSON.stringify(payload));
      assert.equal(payload.error.code, code);
    }
    assert.equal(calls, 0);
    assert.deepEqual(await snapshot(), before);
    const status = await fetch(base + "/integrations/status");
    const payload = await status.json() as { data: { enabled: object; paymentSettlement: string } };
    assert.deepEqual(payload.data.enabled, { cloudStorage: false, cashfree: false });
    assert.equal(payload.data.paymentSettlement, "DISABLED");
    assert.equal((await fetch(base + "/auth/session", { headers: { Cookie: identities.ADVERTISER!.cookie } })).status, 200);
    assert.equal((await fetch(base + "/payments", { headers: { Cookie: identities.ADVERTISER!.cookie } })).status, 200);
    assert.equal((await fetch(base + "/payments")).status, 401);
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
    await db.$disconnect();
  }
});
