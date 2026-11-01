"use client";
import * as React from "react";
import {usePathname,useRouter} from "next/navigation";
import {PortalShell} from "@/components/portal/portal-shell";
import {PortalAccessRequired,PortalLoading} from "@/components/portal/portal-access";
import {api,liveSession} from "@/services/api-client";
import type {LiveSession} from "@/services/api-client";
import {AdminContext,Alert,explain} from "./common";
import {CampaignReviews,DriverReviews,Approvals} from "./reviews";
import {Overview,Users,Support,Analytics,Audit,Payments,Bookings,Settlements,Notifications,Settings} from "./operations";
import {Geo,Screens,Formats,Pricing} from "./catalog";
export function AdminPortal(){
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
 async function signOut(){
  if(!session)return;
  try{
   await api("/auth/logout",{method:"POST",csrfToken:session.csrfToken,body:{}});
   setSession(null);router.replace("/login");router.refresh();
  }catch(e){setError(explain(e));}
 }
 const path=pathname.split("/")[2]??"";
 const titles:Record<string,string>={
  "":"Dashboard",campaigns:"Campaigns",advertisers:"Advertisers",drivers:"Driver partners",
  screens:"Screens and devices",locations:"Locations and zones","ad-formats":"Ad formats and rules",
  pricing:"Pricing",approvals:"Approvals",bookings:"Bookings and schedule",
  payments:"Payments and refunds",settlements:"Driver settlements",analytics:"Reports",
  users:"Users and roles",audit:"Audit history",notifications:"Notifications",support:"Support and disputes",settings:"Security settings"
 };
 let content:React.ReactNode;
 switch(path){
  case "":content=<Overview/>;break;
  case "campaigns":content=<CampaignReviews/>;break;
  case "advertisers":content=<Users onlyRole="ADVERTISER"/>;break;
  case "drivers":content=<DriverReviews/>;break;
  case "screens":content=<Screens/>;break;
  case "locations":content=<Geo/>;break;
  case "ad-formats":content=<Formats/>;break;
  case "pricing":content=<Pricing/>;break;
  case "approvals":content=<Approvals/>;break;
  case "bookings":content=<Bookings/>;break;
  case "payments":content=<Payments/>;break;
  case "settlements":content=<Settlements/>;break;
  case "analytics":content=<Analytics/>;break;
  case "users":content=<Users/>;break;
  case "audit":content=<Audit/>;break;
  case "notifications":content=<Notifications/>;break;
  case "support":content=<Support/>;break;
  case "settings":content=<Settings/>;break;
  default:content=<Alert type="warning">This Admin section is not available.</Alert>;
 }
 if(loading)return <PortalLoading message="Verifying Admin session and MFA…"/>;
 if(!session)return <PortalAccessRequired title="Secure Admin access"
  message={error||"A verified Admin session is required."}
  signInHref={"/login?next="+encodeURIComponent(pathname)} signInLabel="Sign in with Admin MFA"
  retryLabel="Retry secure session" onRetry={()=>{setLoading(true);setRetry(v=>v+1);}}/>;
 return <AdminContext.Provider value={{session}}>
  <PortalShell role="admin" pathname={pathname} title={titles[path]} onSignOut={()=>void signOut()}>
   {content}
  </PortalShell>
 </AdminContext.Provider>;
}
