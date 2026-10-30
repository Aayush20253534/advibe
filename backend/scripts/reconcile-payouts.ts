import { PrismaClient } from "@prisma/client";
import { externalMode } from "../src/integrations/mock-mode.js";
import { loadDatabaseConfig } from "../src/db/config.js";
import { configuredPayoutGateway,financePolicy } from "../src/modules/earnings/provider.js";
import { reconcilePayouts } from "../src/modules/earnings/worker.js";
if(process.env.B18_PAYOUT_WORKER_ENABLED!=="true")throw new Error("Payout worker is not enabled");
financePolicy(process.env,process.env.NODE_ENV==="production");
if(externalMode()==="mock")
 throw new Error("External provider worker is disabled in mock mode; no real settlement, scans, or S3 access");
loadDatabaseConfig();
const gateway=configuredPayoutGateway();
const db=new PrismaClient();
try{await db.$connect();console.log(JSON.stringify(await reconcilePayouts(db,gateway)));}
finally{await db.$disconnect();}
