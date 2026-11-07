import { mkdir, writeFile } from "node:fs/promises";
import { browserName } from "./browser-engine.mjs";

export async function saveBrowserEvidence(page, label, details = {}) {
  const directory = `test-results/${browserName}`;
  const name = label.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  await mkdir(directory, { recursive: true });
  await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true, animations: "disabled" });
  await writeFile(`${directory}/${name}.json`, JSON.stringify({ url: page.url(), ...details }, null, 2));
}

export async function saveBrowserFailure(browser, suite, error) {
  let index = 0;
  for (const context of browser.contexts()) {
    for (const page of context.pages()) {
      try {
        await saveBrowserEvidence(page, `${suite}-failure-${index++}`, { error: String(error) });
      } catch (captureError) {
        console.error("Could not capture browser failure evidence:", captureError);
      }
    }
  }
}
