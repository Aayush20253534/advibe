"use client";
import * as React from "react";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {portalNavigation} from "@/config/navigation";
import {api,liveSession} from "@/services/api-client";
import type {LiveSession} from "@/services/api-client";
import {AdminContext,Alert,secondary,explain} from "./common";
import {CampaignReviews,CreativeReviews,DriverReviews,Approvals} from "./reviews";
import {Overview,Users,Support,Analytics,Audit,Payments,Bookings,Settlements,Notifications,Settings} from "./operations";
import {Geo,Screens,Formats,Pricing} from "./catalog";
const nav=portalNavigation.admin;
export function AdminPortal(){
 const router=useRouter(),pathname=usePathname();
 const [session,setSession]=React.useState<LiveSession|null>(null);
 const [loading,setLoading]=React.useState(true),[error,setError]=React.useState("");
 const [retry,setRetry]=React.useState(0),[open,setOpen]=React.useState(false);
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
  "":"Dashboard",campaigns:"Campaigns",advertisers:"Advertisers",drivers:"Driver Partners",
  screens:"Screens & Devices",locations:"Locations & Zones","ad-formats":"Ad Formats",
  pricing:"Pricing & Commercial",approvals:"Approvals",bookings:"Bookings",
  payments:"Payments & Refunds",settlements:"Driver Settlements",analytics:"Reports & Analytics",
  users:"Users & Roles",audit:"Audit History",notifications:"Notifications",support:"Support & Disputes",settings:"Security & Settings"
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
 if(loading)return <main role="status" className="grid min-h-dvh place-items-center bg-slate-50">Verifying Admin session and MFA…</main>;
 if(!session)return <main className="grid min-h-dvh place-items-center bg-slate-50 p-6">
  <div className="w-full max-w-lg space-y-4 rounded-2xl border bg-white p-6 shadow">
   <h1 className="text-2xl font-bold text-[#182a50]">Secure Admin access</h1>
   <Alert type="error">{error||"A verified Admin session is required."}</Alert>
   <Link href={"/login?next="+encodeURIComponent(pathname)} className={secondary}>Sign in with Admin MFA</Link>
   <button type="button" className={secondary} onClick={()=>{setLoading(true);setRetry(v=>v+1);}}>Retry secure session</button>
  </div>
 </main>;
 return <AdminContext.Provider value={{session}}>
  <div className="min-h-dvh bg-[#f4f6fd] text-[#182a50]">
   <header className="sticky top-0 z-30 border-b border-indigo-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
    <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-3">
     <div className="flex items-center gap-3">
      <button className={secondary+" lg:hidden"} type="button" onClick={()=>setOpen(v=>!v)}
       aria-expanded={open} aria-controls="admin-sidebar">Menu</button>
      <Link href="/admin" className="text-xl font-black tracking-tight text-[#092b53]">Ad<span className="text-[#5b35d5]">Vibe</span> <span className="text-xs font-medium text-slate-500">Admin</span></Link>
     </div>
     <div className="flex items-center gap-3">
      <span className="hidden text-xs font-semibold text-slate-500 sm:block">Authenticated · MFA-enforced</span>
      <button className={secondary} onClick={()=>void signOut()}>Sign out</button>
     </div>
    </div>
   </header>
   <div className="mx-auto flex max-w-[1560px] flex-col lg:flex-row">
    <nav id="admin-sidebar" aria-label="Admin pages" className={(open?"block":"hidden")+" border-b border-indigo-900 bg-[#132854] p-3 lg:sticky lg:top-[65px] lg:block lg:h-[calc(100dvh-65px)] lg:w-[250px] lg:shrink-0 lg:overflow-y-auto"}>
     {nav.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)}
      aria-current={pathname===item.href?"page":undefined} className={"mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold "+(pathname===item.href?"bg-[#6240d7] text-white":"text-indigo-100 hover:bg-white/10")}>
       <item.icon size={17} aria-hidden="true"/>{item.label}
      </Link>)}
    </nav>
    <main className="min-w-0 flex-1 space-y-5 p-4 sm:p-6 lg:p-8">
     <div><p className="text-xs font-bold uppercase tracking-widest text-[#6741d7]">Server-backed Admin operations</p>
      <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{titles[path]??"Admin"}</h1></div>
     {content}
    </main>
   </div>
  </div>
 </AdminContext.Provider>;
}
