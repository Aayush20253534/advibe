"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";

type Mode = "signup" | "login" | "forgot" | "reset" | "verify";
const copy = {
  signup: { title: <>Your next move.<br />Starts here.</>, description: "A workspace for advertisers and the driver partners who keep brands moving." },
  login: { title: <>Welcome back.<br />Keep moving.</>, description: "Your campaigns, creative and account activity. All in one place." },
  forgot: { title: <>A fresh start.<br />The same account.</>, description: "Recover access securely and get back to your BlinkMyAd workspace." },
  reset: { title: <>Your account.<br />Your control.</>, description: "Choose a new password to protect your advertiser or partner account." },
  verify: { title: <>One last step.<br />Then you’re in.</>, description: "Confirm your email address to get started with BlinkMyAd." },
};

export function BmaAuthFrame({ mode, children }: { mode: Mode; children: ReactNode }) {
  return <div data-portal="public" data-bma-auth={mode} className="bma-auth-layout">
    <a href="#auth-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-3">Skip to authentication form</a>
    <aside className="bma-auth-story">
      <BrandLogo width={188} inverse priority />
      <div className="bma-auth-story-copy"><span className="bma-eyebrow">Make your next move visible.</span><h2>{copy[mode].title}</h2><p>{copy[mode].description}</p></div>
      <div className="bma-auth-art"><Image src="/images/blinkmyad/fleet.webp" alt="Illustrative 3D concepts of BlinkMyAd screens on an auto and scooter" fill priority sizes="(min-width:1024px) 46vw, 0px" className="object-cover" /></div>
      <div className="bma-auth-story-bottom"><span>Prayagraj pilot / Illustrative concepts</span><ArrowUpRight size={18} aria-hidden="true" /></div>
    </aside>
    <main id="auth-main" tabIndex={-1} className="bma-auth-main">
      <div className="bma-auth-top"><div className="lg:hidden"><BrandLogo width={165} priority /></div><Link prefetch={false} href="/" className="inline-flex min-h-11 items-center gap-2 text-xs text-ink-muted hover:text-signal"><ArrowLeft size={14} aria-hidden="true" /> Back to website</Link></div>
      <div className="bma-auth-form-wrap">{children}</div>
      <nav aria-label="Legal" className="bma-auth-legal"><Link prefetch={false} href="/privacy">Privacy policy</Link><Link prefetch={false} href="/terms">Terms of service</Link></nav>
    </main>
  </div>;
}
