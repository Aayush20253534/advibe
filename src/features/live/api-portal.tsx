"use client";
import * as React from "react";
import {usePathname,useRouter} from "next/navigation";
import {type PortalRole} from "@/config/navigation";
import {PortalShell} from "@/components/portal/portal-shell";
import {PortalAccessRequired,PortalLoading} from "@/components/portal/portal-access";
import {api,liveSession,type LiveSession} from "@/services/api-client";
import {useSessionExpiry} from "@/services/use-session-expiry";
type ApiPortalContextValue={role:PortalRole;session:LiveSession;expire:(message:string)=>void};
const ApiPortalContext=React.createContext<ApiPortalContextValue|null>(null);
/** Session and expiry callback for screens rendered inside ApiPortal (driver pages). */
export function useApiPortal(){
 const value=React.useContext(ApiPortalContext);
 if(!value)throw new Error("useApiPortal must be used inside ApiPortal");
 return value;
}
/** Session check, revalidation and sign-out for a generic API portal (rendered by the layout). */
export function ApiPortal({role,children}:{role:PortalRole;children:React.ReactNode}){
 const router=useRouter(),pathname=usePathname();
 const [session,setSession]=React.useState<LiveSession|null>(null);
 const [authError,setAuthError]=React.useState("");
 const [loading,setLoading]=React.useState(true),[error,setError]=React.useState("");
 const [busy,setBusy]=React.useState(false);
 React.useEffect(()=>{
  const ac=new AbortController();
  void liveSession(ac.signal).then(current=>{
   if(current.role!==role){setAuthError("Your authenticated account does not have access to the "+role+" portal.");return;}
   setSession(current);setAuthError("");
  }).catch(e=>{if(!ac.signal.aborted){setSession(null);setAuthError(e instanceof Error?e.message:"Unable to verify live session");}})
  .finally(()=>{if(!ac.signal.aborted)setLoading(false);});
  return ()=>ac.abort();
 },[role]);
 React.useEffect(()=>{
  let active=true;
  async function revalidate(){
   if(document.visibilityState!=="visible")return;
   try{
    const current=await liveSession();
    if(!active)return;
    if(current.role!==role){
     setSession(null);
     setAuthError("Your account does not have access to this portal.");
    }else{
     setSession(old=>old?.csrfToken===current.csrfToken?old:current);
    }
   }catch{
    if(!active)return;
    setSession(null);
    setAuthError("Your session is unavailable or has expired. Sign in again.");
   }
  }
  document.addEventListener("visibilitychange",revalidate);
  return ()=>{active=false;document.removeEventListener("visibilitychange",revalidate);};
 },[role]);
 const expire=React.useCallback((message:string)=>{setSession(null);setAuthError(message);},[]);
 useSessionExpiry(session,React.useCallback(()=>expire("Your session has expired. Sign in again."),[expire]));
 const context=React.useMemo(()=>session?{role,session,expire}:null,[role,session,expire]);
 async function signOut(){
  if(!session)return;
  setBusy(true);
  try{await api("/auth/logout",{method:"POST",csrfToken:session.csrfToken});router.replace("/login");router.refresh();}
  catch(err){setError(err instanceof Error?err.message:"Could not sign out");}
  finally{setBusy(false);}
 }
 if(authError||(!loading&&!session))return <PortalAccessRequired title="Live session required"
  message={authError||"Sign in with a verified account."}
  signInHref={"/login?next="+encodeURIComponent(pathname)} signInLabel="Secure sign in"/>;
 if(!session||!context)return <PortalLoading message="Verifying authenticated session…"/>;
 return <ApiPortalContext.Provider value={context}>
  <PortalShell role={role} pathname={pathname} signingOut={busy} onSignOut={()=>void signOut()}>
   {error&&<div role="alert" className="rounded-md border border-danger-border bg-danger-bg p-4 text-sm text-danger-fg">{error}</div>}
   {children}
  </PortalShell>
 </ApiPortalContext.Provider>;
}
