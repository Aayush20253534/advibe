import { readdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=fileURLToPath(new URL("../",import.meta.url));
const runtimeOnly=process.argv.includes("--runtime");
const files=readdirSync(new URL("../tests/",import.meta.url)).filter(name =>
  /\.test\.(mjs|tsx)$/.test(name)&&(!runtimeOnly||name.includes(".runtime.test.")))
  .sort().map(name=>`tests/${name}`);
if(!files.length)throw new Error("No frontend tests discovered");
const child=spawn(process.execPath,["--import","tsx","--test",...files],{
  cwd:root,stdio:"inherit",env:{...process.env,TSX_TSCONFIG_PATH:fileURLToPath(new URL("../tests/tsconfig.runtime.json",import.meta.url))},
});
child.on("error",error=>{console.error(error.message);process.exitCode=1;});
child.on("exit",code=>{process.exitCode=code??1;});
