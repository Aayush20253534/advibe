import { chromium, firefox, webkit } from "playwright";
export const browserName=process.env.PLAYWRIGHT_BROWSER??"chromium";
const engine={chromium,firefox,webkit}[browserName];
if(!engine)throw new Error("PLAYWRIGHT_BROWSER must be chromium, firefox or webkit");
export function launchBrowser(){
  return engine.launch({headless:true,
    ...(browserName==="chromium"?{args:["--no-sandbox"],...(process.env.PW_CHROMIUM_PATH?{executablePath:process.env.PW_CHROMIUM_PATH}:{})}:{})});
}
