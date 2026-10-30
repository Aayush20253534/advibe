import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export function GET(){
 return NextResponse.json({
  service:"advibe-frontend",status:"ok",mode:"api",productionIntegrationsReady:false,
  note:"Frontend liveness only. Verify backend availability at /api/ready. Payments, KYC, payouts and physical devices require separate approvals.",
 },{headers:{"Cache-Control":"no-store, max-age=0"}});
}
