import { readFileSync, writeFileSync } from "node:fs";
import { enumerateApiRoutes } from "../backend/tests/route-inventory.mjs";

const destination = new URL("../contracts/api-routes.current.json", import.meta.url);
const content = JSON.stringify({
  description: "Current Express method/path inventory. Not an OpenAPI schema or a claim of provider verification. The B0 OpenAPI file remains historical.",
  routes: enumerateApiRoutes(),
}, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(destination, "utf8") !== content) {
    throw new Error("API route inventory drift: run npm run contracts:update and review the changes");
  }
  console.log("Current API route inventory matches Express source");
} else {
  writeFileSync(destination, content);
  console.log("Updated current API route inventory");
}
