"use client";
import * as React from "react";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {portalNavigation} from "@/config/navigation";
import {api,apiPage,liveSession} from "@/services/api-client";
import type {LiveSession} from "@/services/api-client";
import {Auth,type Business,Notice,secondary,message} from "./common";
import {CampaignIndex,CampaignEditor,CampaignDetail,CreativeLibrary,Dashboard} from "./workflows";
import {BusinessSettings,Directory,MoneyAndQuotes,Reports,AccountSupport,AccountNotifications} from "./operations";
const nav=portalNavigation.advertiser;
export function AdvertiserPortal(){
 const pathname=usePathname(),router=useRouter();
 const [session,setSession]=React.useState<LiveSession|null>(null);
 const [businesses,setBusinesses]=React.useState<Business[]>([]);
 const [activeId,setActiveId]=React.useState("");
 const [authError,setAuthError]=React.useState("");
 const [loading,setLoading]=React.useState(true);
 const [menu,setMenu]=React.useState(false);
 const [revision,setRevision]=React.useState(0);
 const reloadBusinesses=React.useCallback(async()=>{
  const result=await apiPage<Business>("/businesses?limit=100");
  setBusinesses(result.data);
  setActiveId(previous=>result.data.some(x=>x.id===previous)?previous:result.data[0]?.id??"");
 },[]);
 const refreshSession=React.useCallback(async()=>{
  const current=await liveSession();
  if(current.role!=="advertiser")throw new Error("This account cannot access the advertiser portal.");
  setSession(current);
 },[]);
 React.useEffect(()=>{
  let active=true;
  Promise.all([liveSession(),apiPage<Business>("/businesses?limit=100")])
   .then(([user,collection])=>{
    if(!active)return;
    if(user.role!=="advertiser")throw new Error("This account cannot access the advertiser portal.");
    setSession(user);setBusinesses(collection.data);setActiveId(collection.data[0]?.id??"");setAuthError("");
   }).catch(e=>{if(active){setSession(null);setBusinesses([]);setAuthError(message(e));}})
   .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[revision]);
 React.useEffect(()=>{
  let active=true;
  async function check(){
   if(document.visibilityState!=="visible")return;
   try{const current=await liveSession();if(!active)return;
    if(current.role!=="advertiser")throw new Error("Account role changed. Sign in again.");
    setSession(current);
   }catch(e){if(active){setSession(null);setBusinesses([]);setAuthError(message(e));}}
  }
  document.addEventListener("visibilitychange",check);
  return ()=>{active=false;document.removeEventListener("visibilitychange",check);};
 },[]);
 const signOut=async()=>{
  if(!session)return;
  try{await api("/auth/logout",{method:"POST",csrfToken:session.csrfToken,body:{}});setSession(null);router.replace("/login");router.refresh();}
  catch(e){setAuthError(message(e));}
 };
 const business=businesses.find(x=>x.id===activeId)??null;
 const segment=pathname.split("/")[2]??"home";
 let screen:React.ReactNode;
 if(segment==="home")screen=<Dashboard/>;
 else if(segment==="campaigns"&&pathname.split("/")[3])screen=<CampaignDetail id={pathname.split("/")[3]!}/>;
 else if(segment==="campaigns")screen=<CampaignIndex/>;
 else if(segment==="create-campaign")screen=<CampaignEditor/>;
 else if(segment==="creatives")screen=<CreativeLibrary/>;
 else if(segment==="locations"||segment==="ad-formats")screen=<Directory kind={segment}/>;
 else if(segment==="billing")screen=<MoneyAndQuotes/>;
 else if(segment==="reports")screen=<Reports/>;
 else if(segment==="settings")screen=<BusinessSettings/>;
 else if(segment==="support")screen=<AccountSupport/>;
 else if(segment==="notifications")screen=<AccountNotifications/>;
 else screen=<Notice kind="warning">This section does not have an approved API workflow.</Notice>;
 if(loading)return <main role="status" className="grid min-h-dvh place-items-center bg-slate-50">Verifying your account against the backend…</main>;
 if(!session)return <main className="grid min-h-dvh place-items-center bg-slate-50 p-5"><div className="w-full max-w-lg space-y-5 rounded-2xl bg-white p-7 shadow">
  <h1 className="text-2xl font-bold text-[#103459]">Secure advertiser access</h1>
  <Notice kind="error">{authError||"An authenticated advertiser session is required."}</Notice>
  <Link className={secondary} href={"/login?next="+encodeURIComponent(pathname)}>Sign in</Link>
  <button className={secondary} onClick={()=>{setLoading(true);setRevision(x=>x+1);}}>Retry connection</button>
 </div></main>;
 return <Auth.Provider value={{session,business,businesses,reloadBusinesses,refreshSession}}>
 <div className="min-h-dvh bg-[#f1f6fc] text-[#173554]">
  <header className="sticky top-0 z-30 border-b border-[#d7e5f7] bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
   <div className="mx-auto flex max-w-[1536px] items-center justify-between gap-3">
    <div className="flex items-center gap-3"><button className={secondary+" lg:hidden"} onClick={()=>setMenu(v=>!v)} aria-expanded={menu} aria-controls="advertiser-menu">Menu</button>
     <Link href="/advertiser" className="text-xl font-black tracking-tight text-[#092b53]">Ad<span className="text-[#1768d3]">Vibe</span> <span className="text-xs font-medium text-slate-500">Advertiser</span></Link>
    </div>
    <div className="flex items-center gap-3">
     <div className="hidden text-right text-xs text-slate-600 sm:block"><span className="block font-bold">Authenticated account</span><span>Data from AdVibe API</span></div>
     <button type="button" className={secondary} onClick={()=>void signOut()}>Sign out</button>
    </div>
   </div>
  </header>
  <div className="mx-auto flex max-w-[1536px] flex-col lg:flex-row">
   <nav id="advertiser-menu" aria-label="Advertiser pages" className={(menu?"block":"hidden")+" border-b border-blue-100 bg-[#082d57] p-4 text-white lg:sticky lg:top-[69px] lg:block lg:h-[calc(100dvh-69px)] lg:w-60 lg:shrink-0 lg:overflow-y-auto lg:border-b-0"}>
    {nav.map(x=><Link key={x.href} href={x.href} onClick={()=>setMenu(false)}
     aria-current={pathname===x.href?"page":undefined}
     className={"mb-1 block rounded-xl px-3 py-3 text-sm font-semibold transition-colors "+(pathname===x.href?"bg-[#1768d3] text-white":"text-[#dbe9ff] hover:bg-white/10")}>{x.label}</Link>)}
   </nav>
   <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
     <div><p className="text-xs font-bold uppercase tracking-widest text-[#1768d3]">Advertiser workspace</p>
      <h1 className="mt-1 text-2xl font-extrabold capitalize text-[#092b53] sm:text-3xl">{segment==="home"?"Overview":segment.replaceAll("-"," ")}</h1></div>
     {businesses.length>0&&<label className="text-xs font-bold text-slate-600">Current business
      <select value={activeId} className="mt-1 block min-h-10 max-w-[280px] rounded-xl border border-blue-200 bg-white px-3 text-sm text-slate-900"
       onChange={e=>setActiveId(e.target.value)}>
       {businesses.map(b=><option key={b.id} value={b.id}>{b.displayName}</option>)}
      </select>
     </label>}
    </div>
    {!business&&segment!=="settings"&&<Notice kind="warning">No business is registered for this account. Create one in <Link className="font-bold underline" href="/advertiser/settings">Profile &amp; Settings</Link> before managing campaigns or creatives.</Notice>}
    {screen}
   </main>
  </div>
 </div>
 </Auth.Provider>;
}
