"use client";
import * as React from "react";
import Link from "next/link";
import {useRouter,useSearchParams} from "next/navigation";
import {api,ApiError,liveSession} from "@/services/api-client";
import {safeAuthNext} from "@/lib/auth-navigation.mjs";
import {Alert,buttonVariants} from "@/components/ui";
import {controlClass} from "@/components/ui/input";
import {cn} from "@/lib/utils";
type Mode="login"|"signup"|"verify"|"forgot"|"reset";
const field=cn(controlClass,"mt-1.5 block min-h-11");
const label="block text-sm font-semibold text-ink";
const link="inline-flex min-h-11 items-center font-semibold text-signal underline-offset-4 hover:underline sm:min-h-0";
const intro:Record<Mode,string>={login:"Use the email and password for your AdVibe account.",signup:"Create an advertiser or driver partner account. We’ll email you a code to confirm your address.",
 verify:"Enter the 6-digit code from the email we sent you.",forgot:"Enter your account email and we’ll send you a link to choose a new password.",reset:"Choose a new password of at least 12 characters."};
const otherLinks:Record<Mode,Array<[string,string]>>={login:[["/signup","Create an account"],["/forgot-password","Forgot password"]],signup:[["/login","Already have an account? Sign in"]],
 verify:[["/login","Back to sign in"]],forgot:[["/login","Back to sign in"]],reset:[["/login","Back to sign in"]]};
export function ApiAuthScreen({mode}:{mode:Mode}){
 const router=useRouter(),params=useSearchParams();
 const [role,setRole]=React.useState<"advertiser"|"driver">(params.get("role")==="driver"?"driver":"advertiser");
 const [email,setEmail]=React.useState(""),[password,setPassword]=React.useState("");
 const [displayName,setDisplayName]=React.useState(""),[code,setCode]=React.useState("");
 const [challengeId,setChallengeId]=React.useState(mode==="verify"?params.get("challengeId")??"":""),[ticket,setTicket]=React.useState("");
 const [loading,setLoading]=React.useState(false),[error,setError]=React.useState("");
 const [notice,setNotice]=React.useState("");
 const [resetToken,setResetToken]=React.useState("");
 React.useEffect(()=>{if(mode!=="reset")return;let active=true;
  void Promise.resolve().then(()=>{if(active){const token=new URLSearchParams(location.hash.replace(/^#/,"")).get("token")??"";setResetToken(token);if(token)history.replaceState(null,"",location.pathname+location.search);}});
  return ()=>{active=false;};},[mode]);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setLoading(true);setError("");setNotice("");
  try{
   if(mode==="login"){
    if(challengeId){
     await api("/auth/mfa/verify",{
      method:"POST",body:{challengeId,ticket,code}});
     const session=await liveSession();
     router.replace(safeAuthNext(params.get("next"),session.role));router.refresh();return;
    }
    const result=await api<{challengeId?:string;ticket?:string}>("/auth/login",{
     method:"POST",body:{email:email.trim().toLowerCase(),password}});
    if(result.challengeId&&result.ticket){
     setChallengeId(result.challengeId);setTicket(result.ticket);
     setPassword("");setNotice("Enter your authenticator's 6-digit code.");return;
    }
    const session=await liveSession();
    router.replace(safeAuthNext(params.get("next"),session.role));router.refresh();
   }else if(mode==="signup"){
    const result=await api<{challengeId:string}>("/auth/register",{
     method:"POST",body:{role,email:email.trim().toLowerCase(),password,displayName}});
    setPassword("");router.replace("/verify?challengeId="+encodeURIComponent(result.challengeId));return;
   }else if(mode==="verify"){
    await api("/auth/verify",{method:"POST",body:{challengeId,code}});
    router.replace("/login?verified=1");router.refresh();
   }else if(mode==="forgot"){
    await api("/auth/forgot-password",{method:"POST",body:{email:email.trim().toLowerCase()}});
    setNotice("If the account is eligible, recovery instructions have been sent.");
   }else{
    await api("/auth/reset-password",{method:"POST",body:{resetToken,newPassword:password}});
    setPassword("");setResetToken("");history.replaceState(null,"",location.pathname);
    router.replace("/login?reset=1");router.refresh();
   }
  }catch(e){setError(e instanceof ApiError?e.message:"Unable to reach the live authentication service");}
  finally{setLoading(false);}
 }
 async function resendVerification(){
  if(!email.trim()){setError("Enter the registered email address.");return;}
  setLoading(true);setError("");setNotice("");
  try{
   await api("/auth/resend-verification",{method:"POST",body:{email:email.trim().toLowerCase()}});
   setCode("");setChallengeId("");
   setNotice("If verification is pending, check your email for a new verification link and code. Older codes no longer work.");
  }catch(e){setError(e instanceof ApiError?e.message:"Verification email request failed");}
  finally{setLoading(false);}
 }
 const verification=mode==="verify";
 return <div className="grid place-items-center"><section className="w-full max-w-md rounded-lg border border-line bg-surface p-6 shadow-sm sm:p-8">
  <h1 className="mb-2 font-heading text-2xl font-semibold text-ink">{mode==="login"?"Sign in":mode==="signup"?"Create account":mode==="verify"?"Verify email":mode==="forgot"?"Reset request":"Set new password"}</h1>
  <p className="mb-6 text-sm text-ink-muted">{challengeId&&mode==="login"?"Open your authenticator app and enter the current 6-digit code.":intro[mode]}</p>
  <form className="space-y-4" onSubmit={async e=>{
   if(verification){
    e.preventDefault();setLoading(true);setError("");
    try{await api("/auth/verify",{method:"POST",body:{challengeId,code}});router.replace("/login?verified=1");}
    catch(err){setError(err instanceof Error?err.message:"Verification failed");}finally{setLoading(false);}
   }else await submit(e);
  }}>
   {mode==="signup"&&!verification&&<><label className={label}>Account type<select className={field} value={role} onChange={e=>setRole(e.target.value as "driver"|"advertiser")}><option value="advertiser">Advertiser</option><option value="driver">Driver</option></select></label><label className={label}>Full name<input className={field} required minLength={1} maxLength={100} value={displayName} onChange={e=>setDisplayName(e.target.value)} autoComplete="name"/></label></>}
   {verification?<><label className={label}>Challenge ID<input className={field} required value={challengeId} onChange={e=>setChallengeId(e.target.value)}/></label><label className={label}>Email code<input className={field} required pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value)}/></label></>:
    <>{(mode==="signup"||mode==="forgot"||mode==="login"&&!challengeId)&&<label className={label}>Email<input className={field} type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>}
     {mode==="login"&&challengeId?<label className={label}>Authenticator code<input className={field} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required value={code} onChange={e=>setCode(e.target.value)}/></label>:
      (mode==="login"||mode==="signup"||mode==="reset")&&<><label className={label}>{mode==="reset"?"New password":"Password"}<input className={field} type="password" autoComplete={mode==="login"?"current-password":"new-password"} minLength={mode==="login"?1:12} maxLength={mode==="login"?256:128} required value={password} onChange={e=>setPassword(e.target.value)} aria-describedby={mode==="login"?undefined:"password-hint"}/></label>{mode!=="login"&&<p id="password-hint" className="-mt-2 text-xs text-ink-muted">At least 12 characters.</p>}</>}</>}
   {mode==="reset"&&!resetToken&&<Alert tone="warning">Open the recovery link from your email to continue.</Alert>}
   <button type="submit" disabled={loading||(mode==="reset"&&!resetToken)} className={buttonVariants({variant:"primary",size:"lg",className:"w-full"})}>{loading?"Submitting…":verification?"Verify":challengeId?"Verify authenticator":mode==="login"?"Sign in":mode==="signup"?"Register":mode==="forgot"?"Send recovery email":"Reset password"}</button>
  </form>
  {(notice||(mode==="login"&&params.get("verified")==="1"?"Email verified. Sign in to continue.":mode==="login"&&params.get("reset")==="1"?"Password changed. Sign in again.":""))&&<p role="status" className="mt-4 rounded-md border border-success-border bg-success-bg p-3 text-sm text-success-fg">{notice||(params.get("verified")==="1"?"Email verified. Sign in to continue.":"Password changed. Sign in again.")}</p>}
  {error&&<p role="alert" className="mt-4 rounded-md border border-danger-border bg-danger-bg p-3 text-sm text-danger-fg">{error}</p>}
  {mode==="verify"&&<div className="mt-6 border-t border-line pt-5">
    <label className={label}>Resend to email<input className={field} type="email" autoComplete="email"
      maxLength={320} value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <button type="button" className={cn(link,"mt-3 text-sm disabled:opacity-50")}
      disabled={loading} onClick={()=>void resendVerification()}>Request a new verification email</button>
   </div>}
   <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm">{otherLinks[mode].map(([href,text])=><Link key={href} href={href} className={link}>{text}</Link>)}</div>
 </section></div>;
}
const fallbackHeight:Record<Mode,string>={login:"min-h-[442px] sm:min-h-[414px]",signup:"min-h-[658px] sm:min-h-[630px]",
 verify:"min-h-[613px] sm:min-h-[565px]",forgot:"min-h-[356px] sm:min-h-[348px]",reset:"min-h-[470px] sm:min-h-[442px]"};
/** Suspense fallback the same size as the form card, so the page doesn't jump when the form loads. */
export function AuthFallback({mode}:{mode:Mode}){
 return <div className="grid place-items-center"><section aria-busy="true" className={cn("grid w-full max-w-md place-items-center rounded-lg border border-line bg-surface p-6 sm:p-8",fallbackHeight[mode])}>
  <p role="status" className="text-sm text-ink-muted">Loading secure account form…</p>
 </section></div>;
}
