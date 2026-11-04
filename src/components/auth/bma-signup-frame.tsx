"use client";
import {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";

export function BmaSignupFrame({children}:{children:React.ReactNode}){
 const [heroUnavailable,setHeroUnavailable]=useState(false);
 return <div data-portal="public" className="grid min-h-dvh bg-[#f2f6ff] text-[#091a3b] lg:grid-cols-[49%_51%]">
  <a href="#auth-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-[#102452]">Skip to signup form</a>
  <aside className="relative hidden min-h-dvh overflow-hidden bg-[#020d31] text-white lg:block">
   <Image src={heroUnavailable?"/images/hero/hero-city.webp":"/brand/bma-signup-hero.jpg"} onError={()=>setHeroUnavailable(true)} alt="" fill priority sizes="(min-width:1024px) 49vw, 0px"
    className="object-cover object-bottom" />
   {heroUnavailable&&<Image src="/images/hero/hero-car.png" alt="" width={900} height={640} className="absolute bottom-[5%] left-[1%] w-[98%] object-contain" />}
   <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[#020b2b]/65 via-[#020b2b]/10 to-transparent" />
   <div className="relative z-10 flex min-h-dvh flex-col px-8 pb-7 pt-6 xl:px-[clamp(2.5rem,4.5vw,5rem)] xl:pt-7">
    <div className="flex items-center gap-5 xl:gap-7">
     <Link href="/" aria-label="BlinkMyAd home" className="relative block aspect-[3.12/1] w-[180px] shrink-0 overflow-hidden rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-white xl:w-[200px]">
      <Image src="/brand/bma-signup-logo.svg" alt="BMA, Blink My Ad" fill
       priority sizes="(min-width:1280px) 200px, 180px" className="object-contain" />
     </Link>
     <span aria-hidden="true" className="h-7 w-px shrink-0 bg-white/35" />
     <Link href="/" className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-sm font-medium text-[#d7e3fc] transition hover:text-white focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
      <ArrowLeft aria-hidden="true" className="size-[17px]" /> Back to website
     </Link>
    </div>
    <div className="mt-[clamp(2rem,4vh,4rem)] max-w-[610px]">
     <h1 className="font-heading text-[clamp(2rem,3vw,3.45rem)] font-bold leading-[1.1] tracking-[-.025em] text-white">
      One account for<br className="hidden xl:block" /> advertisers and<br className="hidden xl:block" /> driver partners
     </h1>
     <p className="mt-4 max-w-[510px] text-[clamp(.92rem,1.15vw,1.2rem)] leading-[1.5] text-[#dae2f4]">
      Launch and manage mobile outdoor advertising campaigns, all in one place.
     </p>
    </div>
   </div>
  </aside>
  <main id="auth-main" tabIndex={-1} className="relative isolate flex min-h-dvh min-w-0 items-center justify-center overflow-hidden px-4 py-4 outline-none sm:px-6 lg:px-8 lg:py-3">
   <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_90%_5%,rgba(205,225,255,.72),transparent_49%),linear-gradient(130deg,#edf4ff_0%,#f8fbff_55%,#dbe9ff_100%)]" />
   <div aria-hidden="true" className="pointer-events-none absolute -right-[22%] top-[13%] -z-10 aspect-square w-[75%] rounded-full border-[72px] border-white/25" />
   <div className="w-full max-w-[550px]">
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#031134] to-[#0b2d59] px-3 py-2.5 lg:hidden">
     <Link href="/" aria-label="BlinkMyAd home" className="relative block aspect-[3.12/1] w-[150px] shrink-0 overflow-hidden rounded-md">
      <Image src="/brand/bma-signup-logo.svg" alt="BMA, Blink My Ad" fill priority sizes="150px" className="object-contain" />
     </Link>
     <Link href="/" className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-[#d7e3fc] hover:text-white">
      <ArrowLeft aria-hidden="true" className="size-4"/> Home
     </Link>
    </div>
    {children}
    <nav aria-label="Legal" className="mt-2 flex items-center justify-center gap-5 text-[11px] font-medium text-[#596b8c]">
     <Link href="/privacy" className="rounded-sm hover:text-[#123cd8] hover:underline focus-visible:outline-2">Privacy policy</Link>
     <Link href="/terms" className="rounded-sm hover:text-[#123cd8] hover:underline focus-visible:outline-2">Terms of service</Link>
    </nav>
   </div>
  </main>
 </div>;
}
