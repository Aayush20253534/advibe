"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { brand } from "@/config/brand";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import { trapOverlayTab } from "@/lib/overlay-focus";
import { HomepageFooter } from "@/components/landing/homepage-chrome";
import "@/components/landing/reference-homepage.css";

const primaryNavigation = [
  { label: "Ad formats", href: "/ad-formats" },
  { label: "About", href: "/about" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "For drivers", href: "/for-drivers" },
  { label: "For advertisers", href: "/for-advertisers" },
] as const;

const mobileExtraNavigation = [
  { label: "Home", href: "/" },
  { label: "Locations", href: "/locations" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "Help centre", href: "/help-center" },
] as const;

const footerExplore = [
  { label: "For advertisers", href: "/for-advertisers" },
  { label: "For drivers", href: "/for-drivers" },
  { label: "Ad formats", href: "/ad-formats" },
  { label: "Locations", href: "/locations" },
  { label: "Pricing", href: "/pricing" },
];

export function PublicShell({ children, hideFooter = false, authMode }: { children: React.ReactNode; hideFooter?: boolean; authMode?: "login" | "signup" }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const mobileClose = React.useRef<HTMLButtonElement>(null);
  const mobilePanel = React.useRef<HTMLDivElement>(null);
  const openButton = React.useRef<HTMLButtonElement>(null);
  const previousPath = React.useRef(pathname);

  React.useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  React.useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const frame = window.requestAnimationFrame(() => document.getElementById("public-main")?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
  React.useEffect(() => {
    if (!mobileOpen) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileClose.current?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileOpen(false);
        window.requestAnimationFrame(() => openButton.current?.focus());
        return;
      }
      trapOverlayTab(mobilePanel.current, e);
    }
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = before; document.removeEventListener("keydown", key); };
  }, [mobileOpen]);

  return (
    <div data-portal="public" data-homepage={isHome || undefined} data-auth-mode={authMode} data-page={pathname === "/ad-formats" ? "ad-formats" : pathname === "/about" ? "about" : undefined} className="min-h-screen bg-background">
      <a href="#public-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3">Skip to main content</a>
      <header inert={mobileOpen} aria-hidden={mobileOpen ? true : undefined} className={cn(
        "sticky top-0 z-50 border-b border-line bg-white text-ink transition-[background-color,box-shadow] duration-300",
        scrolled && "shadow-[0_2px_12px_rgba(20,25,35,.05)]",
      )}>
        <div className="bma-ref-header-row mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 xl:px-10">
          <BrandLogo priority className="bma-ref-header-logo" width={240} />
          <nav aria-label="Public website" className="bma-ref-nav">
            {primaryNavigation.map(item => (
              <Link
                prefetch={false}
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="bma-ref-header-actions hidden shrink-0 items-center gap-2 sm:flex">
            <Link prefetch={false} href="/login" aria-current={pathname === "/login" ? "page" : undefined} className="inline-flex min-h-10 items-center justify-center rounded-md px-3 text-[13px] font-semibold text-ink transition-colors hover:bg-paper">Sign in</Link>
            <Link prefetch={false} href="/signup?role=advertiser" className="bma-ref-button">Create a campaign <ArrowUpRight aria-hidden="true" /></Link>
          </div>
          <button ref={openButton} type="button" aria-expanded={mobileOpen} aria-controls="advibe-public-navigation" aria-label="Open public navigation" onClick={() => setMobileOpen(true)} className="bma-ref-menu-button inline-flex size-11 items-center justify-center rounded-md border border-line hover:bg-paper xl:hidden"><Menu className="size-6" aria-hidden="true" /></button>
        </div>
      </header>
      <main inert={mobileOpen} aria-hidden={mobileOpen ? true : undefined} id="public-main" tabIndex={-1} className="min-h-[55dvh] outline-none">{children}</main>
      {!hideFooter && <footer inert={mobileOpen} aria-hidden={mobileOpen ? true : undefined} className="border-t border-white/10 bg-night text-white">
        {isHome ? <HomepageFooter /> : <><div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] lg:gap-8 lg:py-20">
          <div className="space-y-5">
            <BrandLogo inverse width={200} className="w-[180px]" />
            <p className="max-w-[250px] text-sm leading-7 text-[#bac1ce]">Vehicle-screen advertising for a more visible India. Starting in Prayagraj.</p>
          </div>
          <FooterLinks title="Explore" links={footerExplore} />
          <FooterLinks title="Company" links={[{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Help centre", href: "/help-center" }]} />
          <FooterLinks title="Portals" links={[{ label: "Advertiser portal", href: "/advertiser" }, { label: "Driver partner portal", href: "/driver" }, { label: "Sign up", href: "/signup" }]} />
          <FooterLinks title="Legal" links={[{ label: "Privacy policy", href: "/privacy" }, { label: "Terms and conditions", href: "/terms" }]} />
        </div>
        <div className="border-t border-white/10"><div className="mx-auto max-w-[1280px] px-5 py-6 text-xs text-[#bac1ce] sm:px-8">© 2026 {brand.legalName}. Prayagraj pilot launch.</div></div></>}
      </footer>}

      {mobileOpen && <div className="fixed inset-0 z-[90] xl:hidden">
        <button type="button" onClick={() => { setMobileOpen(false); window.requestAnimationFrame(() => openButton.current?.focus()); }} aria-label="Close navigation overlay" className="absolute inset-0 w-full bg-[#02152bcb]" />
        <div id="advibe-public-navigation" ref={mobilePanel} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Public navigation menu" className="absolute inset-y-0 right-0 flex w-[min(90vw,360px)] flex-col overflow-hidden bg-night text-white shadow-overlay">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-4">
            <BrandLogo inverse className="w-[156px]" width={174} />
            <button ref={mobileClose} type="button" onClick={() => { setMobileOpen(false); window.requestAnimationFrame(() => openButton.current?.focus()); }} aria-label="Close menu" className="flex size-11 items-center justify-center rounded-xl border border-white/15"><X className="size-6" aria-hidden="true" /></button>
          </div>
          <nav aria-label="Mobile public pages" className="flex-1 overflow-y-auto px-3 py-4">
            {primaryNavigation.map(item => (
              <Link prefetch={false} key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn("flex min-h-11 items-center rounded-lg px-3 text-base font-semibold text-white/85 hover:bg-white/10", pathname === item.href && "bg-signal text-white")}>
                {item.label}
              </Link>
            ))}
            <div className="my-3 border-t border-white/15" aria-hidden="true" />
            {mobileExtraNavigation.map(item => (
              <Link prefetch={false} key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn("flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-white/75 hover:bg-white/10", pathname === item.href && "bg-signal text-white")}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-white/10 p-4">
            <Link prefetch={false} href="/login" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center justify-center rounded-lg border border-white/30 text-sm font-semibold">Sign in</Link>
            <Link prefetch={false} href="/signup?role=advertiser" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center justify-center rounded-lg bg-signal text-sm font-semibold text-white">Create campaign</Link>
          </div>
        </div>
      </div>}
    </div>
  );
}

function FooterLinks({ title, links }: { title: string; links: ReadonlyArray<{ label: string; href: string }> }) {
  return <div><h2 className="mb-5 font-heading text-sm font-semibold text-white">{title}</h2><ul className="space-y-3">{links.map(link => <li key={link.href}><Link prefetch={false} href={link.href} className="inline-flex min-h-6 items-center text-sm text-[#bac1ce] transition-colors hover:text-white hover:underline">{link.label}</Link></li>)}</ul></div>;
}
