// Public-page lab measurements only. This does not verify hosted performance or INP.
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const base = new URL(process.env.BASE_URL ?? "http://127.0.0.1:3101");
if (!["127.0.0.1", "localhost", "[::1]"].includes(base.hostname)) {
  throw new Error("Run this synthetic measurement against a local test server only");
}
const output = "test-results/lighthouse";
const cli = fileURLToPath(new URL("../node_modules/lighthouse/cli/index.js", import.meta.url));
await mkdir(output, { recursive: true });
const measurements = [];
for (const path of ["/", "/login"]) {
  for (let sample = 1; sample <= 3; sample++) {
    const stem = `${output}/${path === "/" ? "home" : "login"}-${sample}`;
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [cli, new URL(path, base).href,
        "--quiet", "--only-categories=performance,accessibility,best-practices",
        "--form-factor=mobile", "--throttling-method=simulate",
        "--output=json", "--output=html", `--output-path=${stem}`,
        "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage"], {
        env: { ...process.env, CHROME_PATH: chromium.executablePath() },
        stdio: "inherit", timeout: 150000,
      });
      child.once("error", reject);
      child.once("exit", (code, signal) => code === 0 ? resolve() : reject(new Error(`Lighthouse failed (${code ?? signal})`)));
    });
    const report = JSON.parse(await readFile(`${stem}.report.json`, "utf8"));
    if (report.runtimeError) throw new Error(JSON.stringify(report.runtimeError));
    measurements.push({
      path, sample, lighthouseVersion: report.lighthouseVersion, fetchTime: report.fetchTime,
      userAgent: report.userAgent, environment: report.environment, settings: report.configSettings,
      scores: Object.fromEntries(Object.entries(report.categories).map(([id, category]) => [id, Math.round(category.score * 100)])),
      metrics: Object.fromEntries(["first-contentful-paint", "largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time", "speed-index"].map(id => [id, report.audits[id]?.numericValue ?? null])),
      failedAudits: Object.values(report.audits).filter(audit => audit.score !== null && audit.score < 1).map(audit => ({id: audit.id, title: audit.title, score: audit.score, displayValue: audit.displayValue})),
      runWarnings: report.runWarnings,
    });
  }
}
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const summary = ["/", "/login"].map(path => {
  const rows = measurements.filter(row => row.path === path);
  const scores = Object.fromEntries(Object.keys(rows[0].scores).map(key => [key, median(rows.map(row => row.scores[key]))]));
  const metrics = Object.fromEntries(Object.keys(rows[0].metrics).map(key => [key, median(rows.map(row => row.metrics[key]))]));
  return {path, samples: rows.length, medianScores: scores, medianMetrics: metrics,
    targetsMet: {performance: scores.performance >= 90, accessibility: scores.accessibility >= 95,
      bestPractices: scores["best-practices"] >= 95, lcp: metrics["largest-contentful-paint"] <= 2500,
      cls: metrics["cumulative-layout-shift"] <= 0.1}, inp: "Not measured by navigation-only Lighthouse"};
});
await writeFile(`${output}/summary.json`, JSON.stringify({
  context: "GitHub Actions container, local production build, default mobile simulation, fresh browser storage per run, already-running server; no real backend/provider. Lab figures are not field measurements.",
  summary, measurements,
}, null, 2));
console.log(JSON.stringify(summary, null, 2));
