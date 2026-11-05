"use client";
import Image from "next/image";
import Link from "next/link";
import {ArrowLeft,BarChart3,CarFront,Megaphone} from "lucide-react";
import type {ReactNode} from "react";
type Mode="signup"|"login"|"forgot"|"reset";
const copy={
 signup:{title:<>One account for<br/>advertisers and<br/>driver partners</>,description:"Launch and manage mobile outdoor advertising campaigns, all in one place.",illustration:"/brand/bma-signup-hero-v2.jpg"},
 login:{title:<>Welcome back to<br/>Blink My Ad</>,description:"Sign in to manage campaigns, track performance, and access your advertiser or driver account.",illustration:"/brand/bma-login-hero-v2.jpg"},
 forgot:{title:<>Secure access.<br/>Seamless recovery.</>,description:"Request a secure recovery link and get back to managing your Blink My Ad account.",illustration:"/brand/bma-login-hero-v2.jpg"},
 reset:{title:<>Your account.<br/>Your control.</>,description:"Set a strong new password and return to your advertiser or driver dashboard.",illustration:"/brand/bma-login-hero-v2.jpg"},
} as const;
const features=[{label:"Run campaigns",icon:Megaphone},{label:"On-vehicle ads",icon:CarFront},{label:"Real-time tracking",icon:BarChart3}] as const;
export function BmaAuthFrame({mode,children}:{mode:Mode;children:ReactNode}){
 const screen=copy[mode];
 return <div data-portal="public" data-bma-auth={mode} className="min-h-dvh bg-[#eaf2ff] text-[#081a39] lg:grid lg:h-dvh lg:grid-cols-[51%_49%] lg:overflow-hidden">
  <a href="#auth-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-[#1644a4]">Skip to authentication form</a>
  <aside className="relative hidden h-dvh min-h-0 overflow-hidden bg-[#020b27] text-white lg:block">
   {/* The artwork is custom-composed with clear sky above the vehicle. Never crop that sky. */}
   <Image src={screen.illustration} alt="" fill priority sizes="(min-width:1024px) 51vw, 0px" className="pointer-events-none object-fill"/>
   <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-[#030b2a]/45 via-[#030b2a]/10 to-transparent"/>
   <div className="relative z-10 flex h-full flex-col px-[clamp(1.75rem,4vw,4.5rem)] py-[clamp(1.2rem,2.7vh,2.25rem)]">
    <div className="flex shrink-0 items-center gap-[clamp(1rem,2vw,2rem)]">
     <Link href="/" aria-label="BlinkMyAd home" className="relative block aspect-[3.16/1] w-[clamp(9.2rem,12.5vw,12.6rem)] shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
      <Image src="/brand/bma-signup-logo.svg" alt="BMA, Blink My Ad" fill priority sizes="204px" className="object-contain"/>
     </Link>
     <span aria-hidden="true" className="h-7 w-px shrink-0 bg-white/35"/>
     <Link href="/" className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap text-[clamp(.75rem,.98vw,.93rem)] font-medium text-[#dce7fc] transition hover:text-white"><ArrowLeft aria-hidden="true" className="size-4"/> Back to website</Link>
    </div>
    <div className="mt-[clamp(1.9rem,5vh,3.8rem)] max-w-[610px]">
     <h2 className="font-heading text-[clamp(2rem,3vw,3.45rem)] font-bold leading-[1.09] tracking-[-.032em] text-white">{screen.title}</h2>
     <p className="mt-4 max-w-[540px] text-[clamp(.9rem,1.12vw,1.18rem)] leading-[1.48] text-[#dee8fc]">{screen.description}</p>
     <div className="mt-5 flex flex-wrap gap-2.5" aria-label="BlinkMyAd platform features">
      {features.map(({label,icon:Icon})=><div key={label} className="inline-flex items-center gap-2 rounded-xl border border-[#568bff]/55 bg-[#072351]/65 px-2.5 py-2 text-xs font-medium text-[#edf3ff] backdrop-blur-[2px]"><Icon className="size-4 shrink-0 text-[#48c9ff]" aria-hidden="true"/><span>{label}</span></div>)}
     </div>
    </div>
   </div>
  </aside>
  <main id="auth-main" tabIndex={-1} className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-x-hidden bg-[#eff5ff] px-4 py-5 outline-none sm:px-7 lg:h-dvh lg:min-h-0 lg:overflow-y-auto lg:px-[clamp(1.25rem,3vw,4rem)] lg:py-4">
   <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_5%,rgba(197,218,253,.8),transparent_58%),linear-gradient(133deg,#f4f8ff_0%,#e8f1ff_100%)]"/>
   <div className={mode==="login"?"w-full max-w-[590px] shrink-0":"w-full max-w-[510px] shrink-0"}>
    <div className="mb-4 flex items-center justify-between rounded-xl bg-[#06143a] px-3 py-2 lg:hidden">
     <Link href="/" aria-label="BlinkMyAd home" className="relative block aspect-[3.16/1] w-[145px] shrink-0"><Image src="/brand/bma-signup-logo.svg" alt="BMA, Blink My Ad" fill priority sizes="145px" className="object-contain"/></Link>
     <Link href="/" className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-white"><ArrowLeft aria-hidden="true" className="size-4"/> Website</Link>
    </div>
    {children}
    <nav aria-label="Legal" className={mode==="signup"?"mt-2 flex justify-center gap-5 text-xs text-[#516488]":"mt-3 flex justify-center gap-6 text-xs text-[#516488]"}><Link href="/privacy" className="hover:text-[#1352c7] hover:underline">Privacy policy</Link><Link href="/terms" className="hover:text-[#1352c7] hover:underline">Terms of service</Link></nav>
   </div>
  </main>
 </div>;
}
