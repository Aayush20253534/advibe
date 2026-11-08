import { z } from "zod";
import { HttpError } from "../lib/http-error.js";
import { externalMode } from "../integrations/mock-mode.js";

const switches = z.object({
  CLOUD_STORAGE_ENABLED: z.enum(["true", "false"]).default("false"),
  CASHFREE_ENABLED: z.enum(["true", "false"]).default("false"),
});
export interface IntegrationFlags { cloudStorage: boolean; cashfree: boolean }

export function loadIntegrationFlags(env: NodeJS.ProcessEnv = process.env): IntegrationFlags {
  const parsed = switches.safeParse(env);
  if (!parsed.success) {
    throw new Error("Expected true or false for: " + parsed.error.issues.map(i => i.path.join(".")).join(", "));
  }
  return { cloudStorage: parsed.data.CLOUD_STORAGE_ENABLED === "true",
    cashfree: parsed.data.CASHFREE_ENABLED === "true" };
}

export function requireIntegration(flags: IntegrationFlags, name: keyof IntegrationFlags): void {
  if (!flags[name]) throw new HttpError(503,
    name === "cloudStorage" ? "CLOUD_STORAGE_DISABLED" : "CASHFREE_DISABLED",
    name === "cloudStorage" ? "Cloud storage is disabled" : "Cashfree is disabled");
}

export function loadCashfreeConfig(env: NodeJS.ProcessEnv = process.env) {
  requireIntegration(loadIntegrationFlags(env), "cashfree");
  if (!["sandbox", "production"].includes(env.CASHFREE_ENV ?? ""))
    throw new Error("CASHFREE_ENABLED=true requires CASHFREE_ENV=sandbox or production");
  const id = env.CASHFREE_CLIENT_ID?.trim(), secret = env.CASHFREE_CLIENT_SECRET?.trim();
  if (!id || !secret) throw new Error("CASHFREE_ENABLED=true requires CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET");
  let url: URL;
  try { url = new URL(env.CASHFREE_NOTIFY_URL ?? ""); }
  catch { throw new Error("CASHFREE_ENABLED=true requires a valid CASHFREE_NOTIFY_URL"); }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
      url.pathname !== "/api/v1/webhooks/cashfree/payments")
    throw new Error("CASHFREE_NOTIFY_URL must be an HTTPS payment webhook URL without credentials or query parameters");
  return { id, secret, notify: url.href,
    base: env.CASHFREE_ENV === "sandbox" ? "https://sandbox.cashfree.com/pg" : "https://api.cashfree.com/pg" };
}

/** Only opted-in live providers require credentials. Never log their values.
 * AWS's standard credential chain permits workload IAM instead of static keys.
 * Development mocks still require an explicit enable switch at the operation boundary.
 */
export function validateEnabledIntegrations(env: NodeJS.ProcessEnv = process.env): void {
  const flags = loadIntegrationFlags(env);
  if (externalMode(env) === "mock") return;
  if (flags.cloudStorage) {
    const invalid = ["KYC_S3_BUCKET", "CREATIVE_S3_BUCKET"].filter(key =>
      !/^[a-z0-9.-]{3,63}$/.test(env[key] ?? ""));
    invalid.push(...["KYC_S3_REGION", "CREATIVE_S3_REGION"].filter(key => !env[key]?.trim()));
    if (Boolean(env.AWS_ACCESS_KEY_ID?.trim()) !== Boolean(env.AWS_SECRET_ACCESS_KEY?.trim()))
      invalid.push("AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY (supply both or use workload IAM)");
    if (invalid.length) throw new Error("CLOUD_STORAGE_ENABLED=true requires: " + invalid.join(", "));
  }
  if (flags.cashfree) loadCashfreeConfig(env);
}
