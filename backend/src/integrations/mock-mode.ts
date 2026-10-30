import { HttpError } from "../lib/http-error.js";
/**
 * External-service mocks are development/test adapters only. Never run them
 * on a public NODE_ENV=production server, regardless of B23 release stage.
 * First-party database and authentication remain real in mock mode.
 */
export type ExternalMode="mock"|"live";
export function externalMode(env:NodeJS.ProcessEnv=process.env):ExternalMode {
 const raw=env.ADVIBE_EXTERNAL_MODE??"live";
 if(raw!=="live"&&raw!=="mock")
  throw new Error("ADVIBE_EXTERNAL_MODE must be live or mock");
 if(raw==="mock"&&env.NODE_ENV==="production")
  throw new Error("Mock external services are forbidden in production runtime");
 return raw;
}
export function requireMock(env:NodeJS.ProcessEnv=process.env):void {
 if(externalMode(env)!=="mock")
  throw new HttpError(503,"MOCK_SERVICE_DISABLED","Mock service is not enabled");
}
