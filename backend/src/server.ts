import { createApp } from "./app.js";
import { releaseGate } from "./ops/release.js";
import { loadConfig } from "./config/env.js";
import { validateEnabledIntegrations } from "./config/integrations.js";
import { assertDatabaseReady, createDatabase } from "./db/client.js";
import { createLogger } from "./lib/logger.js";
import { createResendSender } from "./modules/auth/email.js";
import { loadAuthSettings } from "./modules/auth/settings.js";
import { externalMode } from "./integrations/mock-mode.js";
import { mockEmailSender,mockCaptchaVerifier,mockCashfreeGateway,mockRefundGateway,
 mockPayoutGateway,mockCreativeStorage,mockKycStorage } from "./integrations/mock-providers.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const mode = externalMode(); // Reject mock services on public production runtimes.
  validateEnabledIntegrations();
  const release = releaseGate(process.env);
  const logger = createLogger(config);
  const authSettings = loadAuthSettings(process.env, config);
  const db = createDatabase();
  try {
    // Fail closed before opening an HTTP port if the database is unreachable.
    await db.$connect();
    await assertDatabaseReady(db);
  } catch (error) {
    await db.$disconnect();
    // Only Prisma's error code (for example P1001 unreachable, P1000 bad credentials) is
    // reported; the driver message can contain connection details.
    const failure = error as { errorCode?: unknown; code?: unknown } | null;
    const id = typeof failure?.errorCode === "string" ? failure.errorCode
      : typeof failure?.code === "string" ? failure.code : "";
    throw new Error("Database is unavailable or misconfigured" + (/^P\d{4}$/.test(id) ? " (" + id + ")" : ""));
  }

  const mock = mode === "mock";
  const app = createApp(config, logger, () => assertDatabaseReady(db), {
    db, settings: authSettings, sender: mock ? mockEmailSender() : createResendSender(authSettings),
  },
   mock ? mockCaptchaVerifier() : undefined,
   mock && config.integrations.cloudStorage ? {storage:mockKycStorage()} : undefined,
   mock && config.integrations.cloudStorage ? {storage:mockCreativeStorage()} : undefined,
   mock && config.integrations.cashfree ? {gateway:mockCashfreeGateway()} : undefined,
   undefined,
   mock && config.integrations.cashfree ? {gateway:mockPayoutGateway()} : undefined,
   mock && config.integrations.cashfree ? {gateway:mockRefundGateway()} : undefined,
  );
  const server = app.listen(config.port, config.host, () => {
    logger.info({ host: config.host, port: config.port, environment: config.nodeEnv, releaseStage: release.mode, externalMode:mode },
      "AdVibe B2 database-backed API listening");
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.keepAliveTimeout = 5_000;
  server.on("error", () => {
    logger.fatal("HTTP listener failure");
    process.exitCode = 1;
  });

  let shuttingDown = false;
  function shutdown(signal: string): void {
    if (shuttingDown) return;
    shuttingDown = true;
    app.locals.ready = false;
    logger.info({ signal }, "Stopping API server");
    const timeout = setTimeout(() => {
      logger.error("Shutdown deadline exceeded");
      process.exit(1);
    }, 10_000);
    timeout.unref();
    server.close(async error => {
      clearTimeout(timeout);
      try { await db.$disconnect(); }
      catch { process.exitCode = 1; }
      if (error) process.exitCode = 1;
    });
  }
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

/** Removes credentials from any URL before a startup error is printed. */
function redact(text: string): string {
  return text.replace(/([a-z][a-z0-9+.-]*:\/\/)[^\s/@]+@/gi, "$1[redacted]@").slice(0, 300);
}

main().catch(error => {
  // Startup errors come from the backend's own configuration checks (they name the
  // variable, never its value) or the sanitized database message above. Print the
  // reason so operators can fix the deployment.
  const reason = error instanceof Error ? redact(error.message) : "unknown error";
  process.stderr.write("AdVibe backend startup failed: " + reason + "\n");
  process.exitCode = 1;
});
