"use client";
import * as React from "react";
import Link from "next/link";
import {useRouter,useSearchParams} from "next/navigation";
import {Eye,EyeOff} from "lucide-react";
import {api,ApiError} from "@/services/api-client";

const field="bma-auth-input";
const fieldLabel="bma-auth-label";

export function BmaSignupForm(){
 const router=useRouter();
 const params=useSearchParams();
 const [role,setRole]=React.useState<"advertiser"|"driver">(params.get("role")==="driver"?"driver":"advertiser");
 const [displayName,setDisplayName]=React.useState("");
 const [email,setEmail]=React.useState("");
 const [password,setPassword]=React.useState("");
 const [showPassword,setShowPassword]=React.useState(false);
 const [loading,setLoading]=React.useState(false);
 const [error,setError]=React.useState("");
 const [notice,setNotice]=React.useState("");
 const [canResend,setCanResend]=React.useState(false);
 const passwordStrong=password.length>=12&&password.length<=128&&/[A-Z]/.test(password)&&/[a-z]/.test(password)&&/[^A-Za-z0-9\s]/.test(password);

 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(loading)return;
  if(!passwordStrong){setError("Password must contain 12+ characters, uppercase, lowercase and a symbol.");return;}
  setLoading(true);setError("");setNotice("");setCanResend(false);
  try{
   const result=await api<{challengeId:string}>("/auth/register",{
    method:"POST",body:{role,email:email.trim().toLowerCase(),password,displayName:displayName.trim()},
   });
   setPassword("");
   router.replace("/verify?challengeId="+encodeURIComponent(result.challengeId));
  }catch(err){
   if(err instanceof ApiError&&err.code==="ACCOUNT_EXISTS"){
    setCanResend(true);
    setError("This email is already registered. Sign in, or resend verification if your account is pending.");
   }else if(err instanceof ApiError&&err.code==="DELIVERY_UNAVAILABLE"){
    setCanResend(true);
    setError("Your pending account was saved, but the verification email could not be delivered. Retry with the same password or request another email.");
   }else{
    setError(err instanceof ApiError?err.message:"Unable to reach the registration service. Please try again.");
   }
  }finally{setLoading(false);}
 }

 async function resendVerification(){
  if(loading||!email.trim())return;
  setLoading(true);setError("");setNotice("");
  try{
   await api("/auth/resend-verification",{method:"POST",body:{email:email.trim().toLowerCase()}});
   setNotice("Verification requested. If your account is pending and email delivery is available, use the link in your inbox or spam folder.");
  }catch(err){setError(err instanceof ApiError?err.message:"Could not request another verification email.");}
  finally{setLoading(false);}
 }

 return <section className="bma-auth-card" aria-labelledby="bma-signup-title">
  <h1 id="bma-signup-title" className="font-heading text-[clamp(1.55rem,1.8vw,1.9rem)] font-bold leading-[1.14] tracking-[-.025em] text-[#091b3c]">Create account</h1>
  <p className="mb-6 mt-3 max-w-[465px] text-sm leading-6 text-ink-muted">
   Create an advertiser or driver partner account. We’ll email you a code to confirm your address.
  </p>
  <form onSubmit={submit} className="space-y-3.5">
   <label className={fieldLabel}>Account type
    <select name="role" value={role} disabled={loading} onChange={e=>setRole(e.target.value as "advertiser"|"driver")}
     className={field} aria-label="Account type">
     <option value="advertiser">Advertiser</option>
     <option value="driver">Driver partner</option>
    </select>
   </label>
   <label className={fieldLabel}>Full name
    <input className={field} type="text" name="displayName" autoComplete="name" required minLength={1} maxLength={100}
     value={displayName} disabled={loading} onChange={e=>setDisplayName(e.target.value)} />
   </label>
   <label className={fieldLabel}>Email
    <input className={field} type="email" name="email" autoComplete="email" required maxLength={320}
     value={email} disabled={loading} onChange={e=>{setEmail(e.target.value);setCanResend(false);}} />
   </label>
   <div>
    <label htmlFor="bma-signup-password" className={fieldLabel}>Password</label>
    <div className="relative">
     <input id="bma-signup-password" className={field+" pr-12"} type={showPassword?"text":"password"} name="password"
      autoComplete="new-password" minLength={12} maxLength={128} required value={password} aria-invalid={password.length>0&&!passwordStrong}
      aria-describedby="bma-signup-password-hint" disabled={loading} onChange={e=>setPassword(e.target.value)} />
     <button type="button" aria-label={showPassword?"Hide password":"Show password"} aria-pressed={showPassword}
      className="absolute inset-y-0 right-1 top-1 inline-flex w-10 items-center justify-center rounded-md text-[#60718f] transition hover:text-[#184fd9] focus-visible:outline-2 focus-visible:outline-[#2466f5]"
      onClick={()=>setShowPassword(v=>!v)}>
      {showPassword?<EyeOff aria-hidden="true" className="size-5" />:<Eye aria-hidden="true" className="size-5" />}
     </button>
    </div>
    <p id="bma-signup-password-hint" className={"mt-1 text-xs "+(password.length>0?(passwordStrong?"text-[#187046]":"text-[#a52424]"):"text-ink-muted")}>12+ characters · uppercase · lowercase · symbol</p>
   </div>
   {error&&<p role="alert" className="rounded-lg border border-[#f4c6c6] bg-[#fff4f3] px-3 py-2 text-sm text-[#a72324]">{error}</p>}
   {canResend&&<button type="button" disabled={loading} onClick={()=>void resendVerification()} className="text-left text-xs font-semibold text-signal hover:underline disabled:opacity-60">Resend verification email</button>}
   {notice&&<p role="status" className="rounded-lg border border-[#bce3d0] bg-[#effaf3] px-3 py-2 text-xs text-[#205c3f]">{notice}</p>}
   <button type="submit" disabled={loading} className="bma-auth-submit">
    {loading?"Creating account…":"Register"}
   </button>
  </form>
  <div className="mt-6 border-t border-line pt-5 text-center text-[13px] text-ink-muted">
   Already have an account?{" "}
   <Link href="/login" className="font-semibold text-signal underline-offset-4 hover:underline focus-visible:outline-2">Sign in</Link>
  </div>
 </section>;
}

export function BmaSignupFallback(){
 return <section aria-busy="true" className="flex min-h-[475px] w-full items-center justify-center rounded-md border border-[#dbe4f2] bg-white shadow-[0_14px_42px_rgba(40,70,130,.11)]">
  <p className="text-sm text-ink-muted" role="status">Loading secure account form…</p>
 </section>;
}
