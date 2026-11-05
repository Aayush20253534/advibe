"use client";
import {usePathname} from "next/navigation";
import {BmaAuthFrame} from "@/components/auth/bma-auth-frame";
import Link from "next/link";
import {ArrowLeft, Check} from "lucide-react";
import {BrandLogo} from "@/components/brand/brand-logo";
export function AuthFrame({children}:{children:React.ReactNode}){
 const pathname=usePathname();
 if(pathname==="/signup"||pathname==="/login"||pathname==="/signin"||pathname==="/forgot-password"||pathname==="/reset-password"){
  const mode=pathname==="/signup"?"signup":pathname==="/forgot-password"?"forgot":pathname==="/reset-password"?"reset":"login";
  return <BmaAuthFrame mode={mode}>{children}</BmaAuthFrame>;
 }
 return <div data-portal="public" className="min-h-dvh bg-paper">
  <a href="#auth-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-brand-blue">Skip to authentication form</a>
  <div className="grid min-h-dvh lg:grid-cols-[minmax(300px,.92fr)_minmax(0,1.08fr)]">
   <aside className="relative hidden overflow-hidden bg-night text-white lg:flex lg:flex-col lg:justify-between">
    <div className="relative z-10 px-9 py-8 xl:px-14"><BrandLogo width={210} priority/><Link href="/" className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm text-[#c3d0e4] hover:text-white"><ArrowLeft className="size-4" aria-hidden/>Back to the website</Link></div>
    <div className="relative z-10 px-9 pb-16 xl:px-14"><p className="max-w-md font-heading text-4xl font-bold leading-tight xl:text-5xl">One account for advertisers and driver partners</p>
     <ul className="mt-8 space-y-3 text-base text-[#c3d0e4]">{["Advertisers plan and submit campaigns","Driver partners apply and track earnings","Admins sign in with two-step verification"].map(x=><li key={x} className="flex items-start gap-2"><Check className="mt-1 size-4 shrink-0 text-[#8fb4ff]" aria-hidden/>{x}</li>)}</ul>
    </div>
   </aside>
   <main id="auth-main" tabIndex={-1} className="min-w-0 outline-none">
    <div className="mx-auto flex min-h-dvh w-full max-w-[750px] flex-col px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
     <div className="mb-5 flex items-center justify-between lg:hidden"><div className="rounded-lg bg-night px-3 py-2"><BrandLogo width={152} priority/></div><Link href="/" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-signal"><ArrowLeft className="size-4" aria-hidden/>Home</Link></div>
     <div className="flex flex-1 items-center justify-center"><div className="w-full max-w-[490px]">{children}</div></div>
     <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm text-ink-muted"><Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-ink hover:underline">Privacy policy</Link><Link href="/terms" className="inline-flex min-h-11 items-center hover:text-ink hover:underline">Terms</Link></div>
    </div>
   </main>
  </div>
 </div>;
}
