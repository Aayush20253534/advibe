import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { loadConfig } from "../src/config/env.js";
import { loadIntegrationFlags, validateEnabledIntegrations } from "../src/config/integrations.js";
import { createCreativeStorage } from "../src/modules/creatives/storage.js";
import { createPrivateKycStorage } from "../src/modules/kyc/storage.js";
import { createCashfreeGateway } from "../src/modules/payments/provider.js";
import { createRefundGateway } from "../src/modules/finance/provider.js";

const configured = {
  CLOUD_STORAGE_ENABLED: "true", CASHFREE_ENABLED: "true",
  KYC_S3_BUCKET: "test-private-kyc", KYC_S3_REGION: "ap-south-1",
  CREATIVE_S3_BUCKET: "test-private-creatives", CREATIVE_S3_REGION: "ap-south-1",
  CASHFREE_ENV: "sandbox", CASHFREE_CLIENT_ID: "synthetic-id", CASHFREE_CLIENT_SECRET: "synthetic-secret",
  CASHFREE_NOTIFY_URL: "https://api.example.invalid/api/v1/webhooks/cashfree/payments",
};

test("providers default off, independently require literal true and ignore disabled credentials", () => {
  assert.deepEqual(loadConfig({}).integrations, { cloudStorage: false, cashfree: false });
  assert.deepEqual(loadIntegrationFlags({ CLOUD_STORAGE_ENABLED: "true" }), { cloudStorage: true, cashfree: false });
  assert.deepEqual(loadIntegrationFlags({ CASHFREE_ENABLED: "true" }), { cloudStorage: false, cashfree: true });
  for (const key of ["CLOUD_STORAGE_ENABLED", "CASHFREE_ENABLED"])
    for (const value of ["1", "yes", "TRUE", "", "false "])
      assert.throws(() => loadConfig({ [key]: value }), new RegExp(key));
  assert.doesNotThrow(() => validateEnabledIntegrations({}));
  assert.doesNotThrow(() => validateEnabledIntegrations({ NODE_ENV: "production",
    CLOUD_STORAGE_ENABLED: "false", CASHFREE_ENABLED: "false", KYC_S3_BUCKET: "!bad!",
    CASHFREE_ENV: "invalid", CASHFREE_CLIENT_SECRET: "leftover", AWS_ACCESS_KEY_ID: "unpaired" }));
});

test("only enabled live integrations require configuration; IAM does not require static keys", () => {
  assert.throws(() => validateEnabledIntegrations({ CLOUD_STORAGE_ENABLED: "true" }), /KYC_S3_BUCKET.*CREATIVE_S3_BUCKET.*KYC_S3_REGION/);
  assert.throws(() => validateEnabledIntegrations({ CASHFREE_ENABLED: "true" }), /CASHFREE_ENV/);
  assert.throws(() => validateEnabledIntegrations({ CASHFREE_ENABLED: "true", CASHFREE_ENV: "sandbox" }), /CASHFREE_CLIENT_ID/);
  assert.throws(() => validateEnabledIntegrations({ ...configured, CASHFREE_NOTIFY_URL: undefined }), /CASHFREE_NOTIFY_URL/);
  assert.throws(() => validateEnabledIntegrations({ ...configured, AWS_ACCESS_KEY_ID: "unpaired" }), /AWS_SECRET_ACCESS_KEY/);
  assert.doesNotThrow(() => validateEnabledIntegrations(configured));
  assert.doesNotThrow(() => validateEnabledIntegrations({ ADVIBE_EXTERNAL_MODE: "mock", CLOUD_STORAGE_ENABLED: "true", CASHFREE_ENABLED: "true" }));
  assert.throws(() => validateEnabledIntegrations({ NODE_ENV: "production", ADVIBE_EXTERNAL_MODE: "mock" }), /mock/i);
  for (const url of ["http://api.example.invalid/api/v1/webhooks/cashfree/payments",
    "https://user:private@api.example.invalid/api/v1/webhooks/cashfree/payments",
    "https://api.example.invalid/wrong", configured.CASHFREE_NOTIFY_URL + "?key=private"])
    assert.throws(() => validateEnabledIntegrations({ ...configured, CASHFREE_NOTIFY_URL: url }), /CASHFREE_NOTIFY_URL/);
});

test("disabled adapters cannot access S3 or Cashfree even with leftover credentials", async () => {
  const env = { ...configured, CLOUD_STORAGE_ENABLED: "false", CASHFREE_ENABLED: "false" };
  const kyc = createPrivateKycStorage(env), creative = createCreativeStorage(env);
  const storageDisabled = { status: 503, code: "CLOUD_STORAGE_DISABLED" };
  for (const action of [() => kyc.presignPut("test", "image/png", 10, 30),
    () => kyc.head("test"), () => kyc.presignGet("test", "v1"),
    () => creative.signedPut("test", "image/png", 10, 30), () => creative.head("test"),
    () => creative.readVersion("test", "v1", 10),
    () => creative.writeProcessed("test", "image/png", Buffer.from("test")),
    () => creative.signedGet("test", "v1")])
    await assert.rejects(action, storageDisabled);
  for (const factory of [createCashfreeGateway, createRefundGateway])
    assert.throws(() => factory(env), { status: 503, code: "CASHFREE_DISABLED" });
});

test("disabled workers stop before connecting to a database or claiming queued jobs", () => {
  for (const [script, code] of [["process-creatives", "CLOUD_STORAGE_DISABLED"],
    ["reconcile-refunds", "CASHFREE_DISABLED"], ["reconcile-payouts", "CASHFREE_DISABLED"]]) {
    const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/" + script + ".ts"], {
      env: { ...process.env, CLOUD_STORAGE_ENABLED: "false", CASHFREE_ENABLED: "false",
        DATABASE_URL: "invalid", DIRECT_URL: "invalid", CREATIVE_WORKER_ENABLED: "true",
        B19_REFUNDS_WORKER_ENABLED: "true", B18_PAYOUT_WORKER_ENABLED: "true" },
      encoding: "utf8", timeout: 15000,
    });
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, new RegExp(code!));
    assert.doesNotMatch(result.stderr, /PrismaClientInitializationError/);
  }
});
