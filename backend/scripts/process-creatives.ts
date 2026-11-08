import { loadIntegrationFlags, requireIntegration, validateEnabledIntegrations } from "../src/config/integrations.js";
import { PrismaClient } from "@prisma/client";
import { externalMode } from "../src/integrations/mock-mode.js";
import { loadDatabaseConfig } from "../src/db/config.js";
import { createCreativeStorage } from "../src/modules/creatives/storage.js";
import { localMediaProcessor } from "../src/modules/creatives/processor.js";
import { processOneCreative } from "../src/modules/creatives/process.js";

requireIntegration(loadIntegrationFlags(),"cloudStorage");
if(process.env.CREATIVE_WORKER_ENABLED!=="true")
  throw new Error("Dedicated creative processing worker is not enabled");
if(externalMode()==="mock")
 throw new Error("External provider worker is disabled in mock mode; no real settlement, scans, or S3 access");
validateEnabledIntegrations();
loadDatabaseConfig();
const db=new PrismaClient();
try{
  await db.$connect();
  const result=await processOneCreative(db,createCreativeStorage(),localMediaProcessor);
  process.stdout.write(JSON.stringify(result??{status:"empty"})+"\n");
}finally{await db.$disconnect();}
