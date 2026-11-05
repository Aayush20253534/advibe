"use client";
import * as React from "react";
import Link from "next/link";
import {useRouter,useSearchParams} from "next/navigation";
import {Eye,EyeOff,LockKeyhole} from "lucide-react";
import {api,ApiError,liveSession} from "@/services/api-client";
import {safeAuthNext} from "@/lib/auth-navigation.mjs";
const field="mt-1.5 block h-[46px] w-full rounded-[10px] border border-[#9aadd0] bg-white px-3.5 text-sm font-medium text-[#071a38] outline-none transition focus:border-[#2563eb] focus:ring-[3px] focus:ring-[#2563eb]/15 disabled:opacity-60";
const label="block text-sm font-semibold text-[#0d1c3a]";
export function BmaLoginForm(){
 const router=useRouter(),params=useSearchParams();
 const [email,setEmail]=React.useState(""),[password,setPassword]=React.useState("");
 const [showPassword,setShowPassword]=React.useState(false);
 const [code,setCode]=React.useState(""),[challengeId,setChallengeId]=React.useState(""),[ticket,setTicket]=React.useState("");
 const [loading,setLoading]=React.useState(false),[error,setError]=React.useState(""),[notice,setNotice]=React.useState("");
 const isMfa=Boolean(challengeId&&ticket);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(loading)return;
  setLoading(true);setError("");setNotice("");
  try{
   if(isMfa){
    await api("/auth/mfa/verify",{method:"POST",body:{challengeId,ticket,code}});
   }else{
    const result=await api<{challengeId?:string;ticket?:string}>("/auth/login",{method:"POST",body:{email:email.trim().toLowerCase(),password}});
    if(result.challengeId&&result.ticket){setChallengeId(result.challengeId);setTicket(result.ticket);setPassword("");setNotice("Enter the 6-digit code from your authenticator app.");return;}
   }
   const session=await liveSession();
   router.replace(safeAuthNext(params.get("next"),session.role));router.refresh();
  }catch(err){setError(err instanceof ApiError?err.message:"Unable to sign in. Please try again.");}
  finally{setLoading(false);}
 }
 const status=params.get("verified")==="1"?"Email verified. Sign in to continue.":params.get("reset")==="1"?"Password changed. Sign in again.":"";
 return <section aria-labelledby="bma-login-title" className="w-full rounded-[20px] border border-[#dbe4f2] bg-white px-6 py-7 shadow-[0_16px_42px_rgba(35,69,131,.13)] sm:px-9 sm:py-8">
  <header className="mb-6">
   <h1 id="bma-login-title" className="font-heading text-[clamp(1.95rem,2.2vw,2.5rem)] font-bold leading-tight tracking-[-.03em] text-[#071a38]">{isMfa?"Verify authenticator":"Sign in"}</h1>
   <p className="mt-2 text-[14px] leading-relaxed text-[#4b5c7a]">{isMfa?"Complete your secure two-step sign-in.":"Access your advertiser or driver partner account."}</p>
  </header>
  <form className="space-y-4" onSubmit={submit}>
   {isMfa?
    <label className={label} htmlFor="bma-login-otp">Authenticator code
     <input id="bma-login-otp" className={field} inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" minLength={6} maxLength={6} required value={code} disabled={loading} onChange={e=>setCode(e.target.value)}/>
    </label>:
    <>
     <label className={label} htmlFor="bma-login-email">Email
      <input id="bma-login-email" className={field} type="email" autoComplete="email" required maxLength={320} value={email} disabled={loading} onChange={e=>setEmail(e.target.value)}/>
     </label>
     <div>
      <label className={label} htmlFor="bma-login-password">Password</label>
      <div className="relative">
       <input id="bma-login-password" className={field+" pr-12"} type={showPassword?"text":"password"} autoComplete="current-password" required minLength={1} maxLength={256} value={password} disabled={loading} onChange={e=>setPassword(e.target.value)}/>
       <button type="button" aria-label={showPassword?"Hide password":"Show password"} aria-pressed={showPassword} disabled={loading} className="absolute inset-y-0 right-1 top-1.5 flex w-10 items-center justify-center rounded-md text-[#526688] hover:text-[#1a62ec]" onClick={()=>setShowPassword(value=>!value)}>
        {showPassword?<EyeOff aria-hidden="true" className="size-5"/>:<Eye aria-hidden="true" className="size-5"/>}
       </button>
      </div>
     </div>
     <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-xs text-[#627694]"><LockKeyhole aria-hidden="true" className="size-3.5"/> Secure sign-in</span>
      <Link href="/forgot-password" className="text-sm font-semibold text-[#0955e8] hover:underline">Forgot password?</Link>
     </div>
    </>
   }
   {(notice||(!isMfa&&status))&&<p role="status" className="rounded-lg border border-[#bbe6d3] bg-[#ebf8f1] px-3 py-2 text-sm text-[#17623a]">{notice||status}</p>}
   {error&&<p role="alert" className="rounded-lg border border-[#f1baba] bg-[#fff1f1] px-3 py-2 text-sm text-[#a11c1c]">{error}</p>}
   <button type="submit" disabled={loading} className="flex h-[50px] w-full items-center justify-center rounded-[11px] bg-gradient-to-r from-[#1559f6] via-[#056eff] to-[#079ff7] text-base font-semibold text-white shadow-[0_8px_20px_rgba(18,90,235,.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70">
    {loading?"Signing in…":isMfa?"Verify authenticator":"Sign in"}
   </button>
   {isMfa&&<button type="button" disabled={loading} className="block w-full text-center text-sm font-semibold text-[#135ad8] hover:underline" onClick={()=>{setChallengeId("");setTicket("");setCode("");setNotice("");setError("");}}>Back to email sign-in</button>}
  </form>
  <div className="mt-7 border-t border-[#dce4f0] pt-6 text-center text-sm text-[#536380]">Don’t have an account?{" "}<Link href="/signup" className="font-semibold text-[#0759ec] hover:underline">Create account</Link></div>
 </section>;
}
export function BmaLoginFallback(){
 return <section aria-busy="true" className="grid min-h-[400px] w-full place-items-center rounded-[20px] border border-[#dbe4f2] bg-white shadow-sm"><p role="status" className="text-sm text-[#526383]">Loading secure sign-in…</p></section>;
}
