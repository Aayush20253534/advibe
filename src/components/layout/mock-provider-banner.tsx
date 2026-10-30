"use client";
import * as React from "react";
type ProviderState={data?:{mode?:string;externalProviders?:string}};
export function MockProviderBanner(){
 const [mock,setMock]=React.useState(false);
 React.useEffect(()=>{
  const controller=new AbortController();
  void fetch("/api/backend/integrations/status",{
   credentials:"same-origin",cache:"no-store",signal:controller.signal,
  }).then(async response=>response.ok?await response.json() as ProviderState:null)
   .then(data=>{if(!controller.signal.aborted&&data?.data?.mode==="mock")setMock(true);})
   .catch(()=>{ /* Unavailable backend never masquerades as a working mock. */ });
  return ()=>controller.abort();
 },[]);
 if(!mock)return null;
 return <aside role="status" aria-label="Development-only external services"
  className="relative z-50 border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-xs font-semibold leading-5 text-amber-950">
  Development preview: third-party services are mocked or disabled. No live emails, payments,
  payouts, refunds, KYC verification or media processing.
 </aside>;
}
