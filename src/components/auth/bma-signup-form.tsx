"use client";
import * as React from "react";
import Link from "next/link";
import {useRouter,useSearchParams} from "next/navigation";
import {Eye,EyeOff} from "lucide-react";
import {api,ApiError} from "@/services/api-client";

const field="mt-1.5 block h-[43px] w-full rounded-[9px] border border-[#9aaac8] bg-white px-3.5 text-[14px] font-medium text-[#091a3b] shadow-[0_1px_2px_rgba(20,50,100,.03)] outline-none transition placeholder:text-[#a1aec5] hover:border-[#658ac6] focus:border-[#2466f5] focus:ring-[3px] focus:ring-[#2466f5]/15 disabled:opacity-60";
const fieldLabel="block text-[13.5px] font-semibold leading-5 text-[#0d1c3a]";

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

 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(loading)return;
  setLoading(true);setError("");
  try{
   const result=await api<{challengeId:string}>("/auth/register",{
    method:"POST",body:{role,email:email.trim().toLowerCase(),password,displayName:displayName.trim()},
   });
   setPassword("");
   router.replace("/verify?challengeId="+encodeURIComponent(result.challengeId));
  }catch(err){
   setError(err instanceof ApiError?err.message:"Unable to reach the registration service. Please try again.");
  }finally{setLoading(false);}
 }

 return <section className="w-full rounded-[16px] border border-[#dbe4f2] bg-white px-5 pb-5 pt-5 shadow-[0_14px_42px_rgba(40,70,130,.11)] sm:px-7 xl:px-8" aria-labelledby="bma-signup-title">
  <h1 id="bma-signup-title" className="font-heading text-[clamp(1.7rem,1.9vw,2.1rem)] font-bold leading-[1.14] tracking-[-.025em] text-[#091b3c]">Create account</h1>
  <p className="mb-4 mt-2 max-w-[485px] text-[13.5px] leading-[1.48] text-[#526383] sm:text-[14px]">
   Create an advertiser or driver partner account. We’ll email you a code to confirm your address.
  </p>
  <form onSubmit={submit} className="space-y-[11px]">
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
     value={email} disabled={loading} onChange={e=>setEmail(e.target.value)} />
   </label>
   <div>
    <label htmlFor="bma-signup-password" className={fieldLabel}>Password</label>
    <div className="relative">
     <input id="bma-signup-password" className={field+" pr-12"} type={showPassword?"text":"password"} name="password"
      autoComplete="new-password" minLength={12} maxLength={128} required value={password}
      aria-describedby="bma-signup-password-hint" disabled={loading} onChange={e=>setPassword(e.target.value)} />
     <button type="button" aria-label={showPassword?"Hide password":"Show password"} aria-pressed={showPassword}
      className="absolute inset-y-0 right-1 top-1.5 inline-flex w-10 items-center justify-center rounded-md text-[#60718f] transition hover:text-[#184fd9] focus-visible:outline-2 focus-visible:outline-[#2466f5]"
      onClick={()=>setShowPassword(v=>!v)}>
      {showPassword?<EyeOff aria-hidden="true" className="size-5" />:<Eye aria-hidden="true" className="size-5" />}
     </button>
    </div>
    <p id="bma-signup-password-hint" className="mt-1.5 text-[11px] text-[#637492]">At least 12 characters.</p>
   </div>
   {error&&<p role="alert" className="rounded-lg border border-[#f4c6c6] bg-[#fff4f3] px-3 py-2 text-sm text-[#a72324]">{error}</p>}
   <button type="submit" disabled={loading} className="mt-0.5 flex h-[46px] w-full items-center justify-center rounded-[10px] bg-gradient-to-r from-[#115cf5] via-[#0575ff] to-[#008ff7] text-[15px] font-semibold text-white shadow-[0_8px_16px_rgba(0,83,236,.15)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#115cf5] disabled:cursor-not-allowed disabled:opacity-65">
    {loading?"Creating account…":"Register"}
   </button>
  </form>
  <div className="mt-4 border-t border-[#dce4f0] pt-4 text-center text-[13px] text-[#536380]">
   Already have an account?{" "}
   <Link href="/login" className="font-semibold text-[#064fe7] underline-offset-4 hover:underline focus-visible:outline-2">Sign in</Link>
  </div>
 </section>;
}

export function BmaSignupFallback(){
 return <section aria-busy="true" className="flex min-h-[540px] w-full items-center justify-center rounded-[16px] border border-[#dbe4f2] bg-white shadow-[0_14px_42px_rgba(40,70,130,.11)]">
  <p className="text-sm text-[#526383]" role="status">Loading secure account form…</p>
 </section>;
}
