/* global URL */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../src/modules/", import.meta.url));
const routeExpression = /\b(router|api|webhooks)\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g;
const fixtureUuid = "00000000-0000-4000-8000-000000000001";

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    const absolute = join(dir, item.name);
    return item.isDirectory() ? walk(absolute) : item.isFile() && item.name.endsWith(".ts") ? [absolute] : [];
  });
}

function endpointFor(file, receiver, path) {
  if (file === "payments/webhook.ts") return "/webhooks/cashfree/payments" + path;
  if (receiver === "webhooks" && file.startsWith("earnings/")) return "/webhooks/cashfree/payouts" + path;
  if (file === "auth/routes.ts") return "/auth" + path;
  if (file === "drivers/routes.ts") return "/drivers" + path;
  return path;
}

/** Read actual route declarations; this is independent of the outdated B0 OpenAPI snapshot. */
export function enumerateApiRoutes() {
  const routes = [
    { method: "GET", path: "/api/v1/health", file: "app.ts" },
    { method: "GET", path: "/api/v1/ready", file: "app.ts" },
    { method: "GET", path: "/api/v1/integrations/status", file: "app.ts" },
  ];
  for (const absolute of walk(root)) {
    const file = relative(root, absolute).replaceAll("\\", "/");
    const source = readFileSync(absolute, "utf8");
    const regex = new RegExp(routeExpression.source, "g");
    for (const match of source.matchAll(regex)) {
      const relativePath = endpointFor(file, match[1], match[3]).replace(/\/$/, "");
      routes.push({ method: match[2].toUpperCase(), path: "/api/v1" + relativePath, file });
    }
  }
  return routes.sort((a, b) => (a.path + a.method).localeCompare(b.path + b.method));
}

export function isExternalProviderRoute({ path }) {
  return (
    /^\/api\/v1\/(payments(?:\/|$)|webhooks\/cashfree\/|admin\/payouts(?:\/|$))/.test(path) ||
    /^\/api\/v1\/reservations\/holds\/:[^/]+\/confirm$/.test(path) ||
    /^\/api\/v1\/creatives\/upload-intents$/.test(path) ||
    /^\/api\/v1\/creatives\/assets\/:[^/]+\/complete$/.test(path) ||
    /^\/api\/v1\/admin\/creatives\/:[^/]+\/preview-url$/.test(path) ||
    /^\/api\/v1\/drivers\/documents\/upload-intents$/.test(path) ||
    /^\/api\/v1\/drivers\/documents\/:[^/]+\/complete$/.test(path) ||
    /^\/api\/v1\/admin\/driver-documents\/:[^/]+\/download-url$/.test(path) ||
    path === "/api/v1/webhooks/kyc/document-scan" ||
    path === "/api/v1/drivers/me/beneficiaries"
  );
}

export function isPublicReadRoute({ method, path }) {
  return method === "GET" && (
    ["/api/v1/health", "/api/v1/ready", "/api/v1/integrations/status"].includes(path) ||
    path.startsWith("/api/v1/public/")
  );
}

export function concretePath(path) {
  return path.replace(/:[A-Za-z_][A-Za-z0-9_]*/g, fixtureUuid);
}
