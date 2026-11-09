"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BarChart3, Megaphone, ShieldCheck, Wallet } from "lucide-react";
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

const visualCopy = {
  login: {
    eyebrow: "Welcome back",
    title: <>Sign in to your<br />BlinkMyAd account</>,
    description: "Manage campaigns, upload creatives, track performance and grow your reach on the move.",
    features: [
      { title: "Run flexible campaigns", description: "On bike, auto and car screens", icon: Megaphone },
      { title: "Track real performance", description: "See reach, routes and results", icon: BarChart3 },
      { title: "Safe and compliant", description: "Reviewed and verified by our team", icon: ShieldCheck },
    ],
  },
  signup: {
    eyebrow: "Get started",
    title: <>Your next move.<br />Starts here.</>,
    description: "Create an account to run campaigns as an advertiser or partner with us as a driver.",
    features: [
      { title: "Run local, flexible campaigns", description: "On bike, auto and car screens", icon: Megaphone },
      { title: "Earn on your daily routes", description: "For drivers and fleet partners", icon: Wallet },
      { title: "Secure and verified", description: "Your data stays private and protected", icon: ShieldCheck },
    ],
  },
};

export function BmaAuthFrame({ mode, children }: { mode: Mode; children: ReactNode }) {
  if (mode === "login" || mode === "signup") {
    const view = visualCopy[mode];
    return (
      <div data-portal="public" data-auth-mode={mode} className="bma-auth-minimal-shell">
        <a href="#public-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3">
          Skip to authentication form
        </a>
        <header className="bma-auth-minimal-header">
          <BrandLogo href="/" priority width={214} />
        </header>
        <main id="public-main" tabIndex={-1} className="bma-auth-minimal-main">
          <div data-bma-auth={mode} className="bma-reference-auth">
          <aside className="bma-reference-auth-story" aria-label="About BlinkMyAd">
            <Image
              src="/images/hero/signin.png"
              alt=""
              aria-hidden="true"
              fill
              priority
              sizes="(min-width: 901px) 50vw, 0px"
              className="bma-reference-auth-backdrop"
            />
            <div className="bma-reference-auth-story-copy">
              <div className="bma-reference-auth-eyebrow">
                <span>{view.eyebrow}</span><i aria-hidden="true" />
              </div>
              <h2>{view.title}</h2>
              <p>{view.description}</p>
              <ul className="bma-reference-auth-features">
                {view.features.map(({ title, description, icon: Icon }) => (
                  <li key={title}>
                    <span className="bma-reference-auth-feature-icon"><Icon aria-hidden="true" /></span>
                    <span><strong>{title}</strong><small>{description}</small></span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <section className="bma-reference-auth-main" aria-label={mode === "login" ? "Sign in form" : "Create account form"}>
            <div className="bma-auth-form-wrap">{children}</div>
          </section>
          </div>
        </main>
      </div>
    );
  }

  // Password recovery and verification retain the established secure, compact layout.
  return (
    <div data-portal="public" data-bma-auth={mode} className="bma-auth-layout">
      <a href="#auth-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-3">Skip to authentication form</a>
      <aside className="bma-auth-story">
        <BrandLogo width={188} inverse priority />
        <div className="bma-auth-story-copy">
          <span className="bma-eyebrow">Make your next move visible.</span>
          <h2>{copy[mode].title}</h2>
          <p>{copy[mode].description}</p>
        </div>
        <div className="bma-auth-art"><Image src="/images/blinkmyad/fleet.webp" alt="Illustrative 3D concepts of BlinkMyAd screens on an auto and scooter" fill priority sizes="(min-width:1024px) 46vw, 0px" className="object-cover" /></div>
        <div className="bma-auth-story-bottom"><span>Prayagraj pilot / Illustrative concepts</span><ArrowUpRight size={18} aria-hidden="true" /></div>
      </aside>
      <main id="auth-main" tabIndex={-1} className="bma-auth-main">
        <div className="bma-auth-top">
          <div className="lg:hidden"><BrandLogo width={165} priority /></div>
          <Link prefetch={false} href="/" className="inline-flex min-h-11 items-center gap-2 text-xs text-ink-muted hover:text-signal"><ArrowLeft size={14} aria-hidden="true" /> Back to website</Link>
        </div>
        <div className="bma-auth-form-wrap">{children}</div>
        <nav aria-label="Legal" className="bma-auth-legal">
          <Link prefetch={false} href="/privacy">Privacy policy</Link>
          <Link prefetch={false} href="/terms">Terms of service</Link>
        </nav>
      </main>
    </div>
  );
}
