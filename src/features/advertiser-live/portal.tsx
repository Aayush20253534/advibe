"use client";
import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {usePathname,useRouter} from "next/navigation";
import {AdvertiserReferenceShell} from "./advertiser-shell";
import {PortalAccessRequired,PortalLoading} from "@/components/portal/portal-access";
import {useSessionExpiry} from "@/services/use-session-expiry";
import {Select} from "@/components/ui";
import {api,apiPage,liveSession} from "@/services/api-client";
import type {LiveSession} from "@/services/api-client";
import {Auth,type Business,Notice,message} from "./common";
/**
 * Remounts business-specific screens when the advertiser switches business,
 * as the former screen switch did with key={...+activeId}.
 */
export function BusinessScoped({children}:{children:React.ReactNode}){
 const auth=React.useContext(Auth);
 return <React.Fragment key={auth?.business?.id??"none"}>{children}</React.Fragment>;
}
/** Session, role and business context for every advertiser page (rendered by the layout). */
export function AdvertiserPortal({children}:{children:React.ReactNode}){
 const pathname=usePathname(),router=useRouter();
 const [session,setSession]=React.useState<LiveSession|null>(null);
 const [businesses,setBusinesses]=React.useState<Business[]>([]);
 const [activeId,setActiveId]=React.useState("");
 const [authError,setAuthError]=React.useState("");
 const [loading,setLoading]=React.useState(true);
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
 useSessionExpiry(session,React.useCallback(()=>{setSession(null);setBusinesses([]);setAuthError("Your session has expired. Sign in again.");},[]));
 const signOut=async()=>{
  if(!session)return;
  try{await api("/auth/logout",{method:"POST",csrfToken:session.csrfToken,body:{}});setSession(null);router.replace("/login");router.refresh();}
  catch(e){setAuthError(message(e));}
 };
 const business=businesses.find(x=>x.id===activeId)??null;
 const segment=pathname.split("/")[2]??"home";
 if(loading)return <PortalLoading message="Verifying your account against the backend…"/>;
 if(!session)return <PortalAccessRequired title="Secure advertiser access"
  message={authError||"An authenticated advertiser session is required."}
  signInHref={"/login?next="+encodeURIComponent(pathname)} signInLabel="Sign in"
  retryLabel="Retry connection" onRetry={()=>{setLoading(true);setRevision(x=>x+1);}}/>;
 const detailTitle=segment==="campaigns"&&pathname.split("/")[3]?"Campaign details":undefined;
 const descriptions:Record<string,string>={
  home:"Plan, review and manage your campaigns from one workspace.",
  campaigns:"See the status of your drafts and submitted campaigns, with updates from review.",
  "create-campaign":"Build a free draft, choose your creative and submit it for human review.",
  creatives:"Organise advertising creatives and track their review status.",
  "ad-formats":"Compare published placements and prepare creative files for each screen.",
  locations:"Explore published Prayagraj areas and planning information.",
  billing:"Review quotes and payment attempts without confusing estimates with receipts.",
  reports:"Follow recorded campaign activity and export account data.",
  notifications:"Keep track of account, creative and campaign updates.",
  support:"Contact the team about campaigns, accounts and platform questions.",
  settings:"Manage your identity, business details and verification status.",
 };
 const pageDescription=pathname.split("/")[3]&&segment==="campaigns"
  ?"Inspect campaign details, review its status and take permitted actions."
  :descriptions[segment]??descriptions.home;
 const createAction=segment!=="create-campaign"?
  <Link href="/advertiser/create-campaign" className="bma-adv-new-campaign">
   <Plus aria-hidden="true" /> New campaign
  </Link>:undefined;
 const businessSwitcher=businesses.length>0?<label className="flex items-center gap-2 text-sm text-ink-muted">
  <span className="shrink-0">Business</span>
  <Select value={activeId} className="min-h-9 py-1.5 sm:max-w-[240px]" onChange={e=>setActiveId(e.target.value)}>
   {businesses.map(b=><option key={b.id} value={b.id}>{b.displayName}</option>)}
  </Select>
 </label>:undefined;
 const pageTitle=detailTitle??({"home":"Dashboard","campaigns":"My Campaigns","create-campaign":"Create Campaign","creatives":"Creative Library","ad-formats":"Ad Formats","locations":"Locations","billing":"Wallet & Payments","reports":"Reports","notifications":"Notifications","support":"Help & Support","settings":"Profile & Settings"}[segment]??"Dashboard");
 return <Auth.Provider value={{session,business,businesses,reloadBusinesses,refreshSession}}>
  <AdvertiserReferenceShell key={pathname} title={pageTitle}
   description={pageDescription} actions={createAction} context={businessSwitcher}
   onSignOut={()=>void signOut()}>
   {authError&&<Notice kind="error">{authError}</Notice>}
   {!business&&segment!=="settings"&&<Notice kind="warning">No business is registered for this account. Create one in <Link className="font-bold underline" href="/advertiser/settings">Profile and settings</Link> before managing campaigns or creatives.</Notice>}
   {children}
  </AdvertiserReferenceShell>
 </Auth.Provider>;
}
