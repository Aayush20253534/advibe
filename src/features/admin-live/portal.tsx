"use client";
import * as React from "react";
import Link from "next/link";
import {ArrowUpRight,ClipboardCheck} from "lucide-react";
import {usePathname,useRouter} from "next/navigation";
import {PortalShell} from "@/components/portal/portal-shell";
import {PortalAccessRequired,PortalLoading} from "@/components/portal/portal-access";
import {api,liveSession} from "@/services/api-client";
import type {LiveSession} from "@/services/api-client";
import {useSessionExpiry} from "@/services/use-session-expiry";
import {AdminContext,explain,Alert} from "./common";
import {ADMIN_ROOT,ADMIN_LOGIN} from "@/lib/admin-paths.mjs";
/** Live Admin role check for every admin page (rendered by the layout). */
export function AdminPortal({children}:{children:React.ReactNode}){
 const router=useRouter(),pathname=usePathname();
 const [session,setSession]=React.useState<LiveSession|null>(null);
 const [loading,setLoading]=React.useState(true),[error,setError]=React.useState("");
 const [retry,setRetry]=React.useState(0);
 React.useEffect(()=>{
  let active=true;
  void liveSession().then(user=>{
   if(!active)return;
   if(user.role!=="admin")throw new Error("This account has no Admin permission.");
   setSession(user);setError("");
  }).catch(e=>{if(active){setSession(null);setError(explain(e));}})
   .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[retry]);
 React.useEffect(()=>{
  let active=true;
  async function verify(){
   if(document.visibilityState!=="visible")return;
   try{
    const current=await liveSession();
    if(!active)return;
    if(current.role!=="admin")throw new Error("Admin permission no longer valid.");
    setSession(current);
   }catch(e){if(active){setSession(null);setError(explain(e));}}
  }
  document.addEventListener("visibilitychange",verify);
  return ()=>{active=false;document.removeEventListener("visibilitychange",verify);};
 },[]);
 useSessionExpiry(session,React.useCallback(()=>{setSession(null);setError("Your Admin session has expired. Sign in again.");},[]));
 async function signOut(){
  if(!session)return;
  try{
   await api("/auth/logout",{method:"POST",csrfToken:session.csrfToken,body:{}});
   setSession(null);router.replace(ADMIN_LOGIN);router.refresh();
  }catch(e){setError(explain(e));}
 }
 const path=pathname.slice(ADMIN_ROOT.length).split("/")[1]??"";
 const descriptions:Record<string,string>={
  "":"Review platform activity, prioritize decisions and manage operations from one place.",
  campaigns:"Review submissions, statuses and campaign approvals without losing the audit trail.",
  advertisers:"Manage advertiser identities, verification and account status.",
  drivers:"Review partner applications, vehicles and document checks.",
  screens:"Track registered screens, device state and location assignments.",
  locations:"Maintain the cities, zones and inventory locations used by the platform.",
  "ad-formats":"Review supported media placements and publication rules.",
  pricing:"Configure governed screen-day rates and inspect approved tax policies.",
  approvals:"Make audited decisions on pending campaigns, creative assets and driver applications.",
  bookings:"Inspect confirmed bookings and scheduled campaign activity.",
  payments:"Reconcile verified payment records and refund state.",
  settlements:"Inspect driver earnings and provider-confirmed settlements.",
  analytics:"Read the platform report and export supported operational data.",
  users:"Search and manage account roles and permitted status changes.",
  audit:"Trace sensitive decisions and export a bounded audit history.",
  notifications:"Review operational notices and account alerts.",
  support:"Resolve customer, partner and platform support requests.",
  settings:"Inspect security controls and integration readiness."
 };
 const actionTarget=path==="approvals"?"analytics":"approvals";
 const adminAction=<Link href={ADMIN_ROOT+"/"+actionTarget} className="bma-admin-header-action">
  <ClipboardCheck aria-hidden="true" />{path==="approvals"?"View reports":"Review approvals"}<ArrowUpRight aria-hidden="true" />
 </Link>;
 const titles:Record<string,string>={
  "":"Dashboard",campaigns:"Campaigns",advertisers:"Advertisers",drivers:"Driver partners",
  screens:"Screens and devices",locations:"Locations and zones","ad-formats":"Ad formats and rules",
  pricing:"Pricing",approvals:"Approvals",bookings:"Bookings and schedule",
  payments:"Payments and refunds",settlements:"Driver settlements",analytics:"Reports",
  users:"Users and roles",audit:"Audit history",notifications:"Notifications",support:"Support and disputes",settings:"Security settings"
 };
 if(loading)return <PortalLoading message="Verifying your Admin session…"/>;
 if(!session)return <PortalAccessRequired title="Secure Admin access"
  message={error||"A verified Admin session is required."}
  signInHref={ADMIN_LOGIN+"?next="+encodeURIComponent(pathname)} signInLabel="Secure Admin sign in"
  retryLabel="Retry secure session" onRetry={()=>{setLoading(true);setRetry(v=>v+1);}}/>;
 return <AdminContext.Provider value={{session}}>
  <PortalShell role="admin" pathname={pathname} title={titles[path]}
   description={descriptions[path]??"Manage platform operations and review live records."}
   actions={adminAction} onSignOut={()=>void signOut()}>
   {error&&<Alert type="error">{error}</Alert>}
   {children}
  </PortalShell>
 </AdminContext.Provider>;
}
