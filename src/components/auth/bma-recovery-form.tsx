"use client";
import * as React from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowLeft,Eye,EyeOff,Mail,ShieldCheck} from "lucide-react";
import {api,ApiError} from "@/services/api-client";

type Mode="forgot"|"reset";
const inputClass="bma-auth-input";
const labelClass="bma-auth-label";

/** Reset tokens arrive only in URL fragments and are removed from the address bar immediately. */
export function BmaRecoveryForm({mode}:{mode:Mode}){
 const router=useRouter();
 const [email,setEmail]=React.useState("");
 const [password,setPassword]=React.useState("");
 const [confirm,setConfirm]=React.useState("");
 const [showPassword,setShowPassword]=React.useState(false);
 const [token,setToken]=React.useState("");
 const [loading,setLoading]=React.useState(false);
 const [error,setError]=React.useState("");
 const [notice,setNotice]=React.useState("");
 const [tokenLoaded,setTokenLoaded]=React.useState(mode==="forgot");
 const consumedToken=React.useRef<string|null>(null);

 React.useEffect(()=>{
  if(mode!=="reset")return;
  // Retain only in this mounted form; Strict Mode can replay the effect after the URL is scrubbed.
  if(consumedToken.current===null){
   const params=new URLSearchParams(window.location.hash.replace(/^#/,""));
   consumedToken.current=params.get("token")??"";
  }
  if(window.location.hash)window.history.replaceState(null,"",window.location.pathname+window.location.search);
  React.startTransition(()=>{setToken(consumedToken.current??"");setTokenLoaded(true);});
 },[mode]);

 const validPassword=password.length>=12&&password.length<=128&&/[A-Z]/.test(password)&&/[a-z]/.test(password)&&/[^A-Za-z0-9\s]/.test(password);

 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(loading)return;
  if(mode==="reset"){
   if(!token){setError("This recovery link is missing or invalid. Request a new link.");return;}
   if(!validPassword){setError("Use 12+ characters with uppercase, lowercase and a symbol.");return;}
   if(password!==confirm){setError("Passwords do not match.");return;}
  }
  setError("");setNotice("");setLoading(true);
  try{
   if(mode==="forgot"){
    await api("/auth/forgot-password",{method:"POST",body:{email:email.trim().toLowerCase()}});
    // This answer is intentionally the same for present and absent accounts.
    setNotice("If your account is eligible, a recovery link will be sent. Check your inbox and spam folder. The link expires in 20 minutes.");
   }else{
    await api("/auth/reset-password",{method:"POST",body:{resetToken:token,newPassword:password}});
    setPassword("");setConfirm("");setToken("");consumedToken.current="";
    router.replace("/login?reset=1");router.refresh();
   }
  }catch(err){
   if(mode==="reset"&&err instanceof ApiError&&err.code==="INVALID_CREDENTIALS"){
    setToken("");consumedToken.current="";setError("This recovery link has expired or has already been used. Request another link.");
   }else{
    setError(err instanceof ApiError?err.message:"The authentication service could not be reached. Please try again.");
   }
  }finally{setLoading(false);}
 }

 return <section aria-labelledby="bma-recovery-title" className="bma-auth-card">
  <div aria-hidden="true" className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#125eea]">
   {mode==="forgot"?<Mail className="size-5"/>:<ShieldCheck className="size-5"/>}
  </div>
  <h1 id="bma-recovery-title" className="font-heading text-[clamp(1.8rem,2.1vw,2.2rem)] font-bold leading-tight tracking-[-.025em] text-[#091b3c]">
   {mode==="forgot"?"Forgot your password?":"Create a new password"}
  </h1>
  <p className="mb-5 mt-2 text-[14px] leading-relaxed text-ink-muted">
   {mode==="forgot"?"Enter your registered email and we’ll send instructions to reset your password.":"Choose a strong password to secure your BlinkMyAd account."}
  </p>
  <form onSubmit={submit} className="space-y-4">
   {mode==="forgot"?
    <label className={labelClass} htmlFor="bma-recovery-email">Email address
     <input id="bma-recovery-email" type="email" className={inputClass} autoComplete="email"
      required maxLength={320} value={email} disabled={loading} onChange={event=>setEmail(event.target.value)}
      placeholder="you@example.com"/>
    </label>:
    <>
     {!tokenLoaded&&<p role="status" className="text-sm text-ink-muted">Checking recovery link…</p>}
     {tokenLoaded&&!token&&<p role="alert" className="rounded-lg border border-[#eed0a1] bg-[#fff8ed] px-3 py-2 text-sm text-[#86501a]">
      No valid recovery link is available. Request a new password reset email.
     </p>}
     <div>
      <label className={labelClass} htmlFor="bma-new-password">New password</label>
      <div className="relative">
       <input id="bma-new-password" type={showPassword?"text":"password"} className={inputClass+" pr-12"}
        autoComplete="new-password" minLength={12} maxLength={128} required
        aria-describedby="bma-new-password-policy" value={password} disabled={loading||!token}
        onChange={event=>setPassword(event.target.value)}/>
       <button type="button" disabled={loading||!token} aria-label={showPassword?"Hide password":"Show password"}
        onClick={()=>setShowPassword(value=>!value)}
        className="absolute right-1 top-2 inline-flex size-10 items-center justify-center rounded-lg text-[#627696] hover:text-[#185de5] disabled:opacity-50">
        {showPassword?<EyeOff aria-hidden="true" className="size-5"/>:<Eye aria-hidden="true" className="size-5"/>}
       </button>
      </div>
      <p id="bma-new-password-policy" className={"mt-1 text-xs "+(password.length>0?(validPassword?"text-[#177c52]":"text-[#a52424]"):"text-ink-muted")}>
       12+ characters · uppercase · lowercase · symbol
      </p>
     </div>
     <label className={labelClass} htmlFor="bma-confirm-password">Confirm new password
      <input id="bma-confirm-password" type={showPassword?"text":"password"} className={inputClass}
       autoComplete="new-password" required minLength={12} maxLength={128}
       value={confirm} disabled={loading||!token} onChange={event=>setConfirm(event.target.value)}/>
     </label>
     {confirm.length>0&&confirm!==password&&<p role="status" className="text-xs text-[#a52424]">Passwords do not match.</p>}
    </>
   }
   {error&&<p role="alert" className="rounded-lg border border-[#f1c2c2] bg-[#fff1f1] px-3 py-2 text-sm text-[#a32424]">{error}</p>}
   {notice&&<p role="status" className="rounded-lg border border-[#bcdccb] bg-[#f0faf3] px-3 py-3 text-sm text-[#245a3c]">{notice}</p>}
   <button type="submit" disabled={loading||(mode==="reset"&&(!token||!tokenLoaded))}
    className="bma-auth-submit">
    {loading?"Submitting…":mode==="forgot"?"Send reset link":"Reset password"}
   </button>
  </form>
  <div className="mt-5 border-t border-[#dde5ef] pt-4 text-center text-sm text-ink-muted">
   <Link href={mode==="forgot"?"/login":"/forgot-password"} className="inline-flex items-center gap-1.5 font-semibold text-signal hover:underline">
    <ArrowLeft aria-hidden="true" className="size-4"/>
    {mode==="forgot"?"Back to sign in":"Request a new reset link"}
   </Link>
  </div>
 </section>;
}
export function BmaRecoveryFallback({mode}:{mode:Mode}){
 return <section aria-busy="true" className="grid min-h-[360px] w-full place-items-center rounded-md border border-[#dce5f2] bg-white shadow-sm">
  <p role="status" className="text-sm text-ink-muted">{mode==="forgot"?"Loading password recovery…":"Checking recovery link…"}</p>
 </section>;
}
