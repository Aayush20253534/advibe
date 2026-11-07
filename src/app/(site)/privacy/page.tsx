import { publicMetadata } from "@/config/public-metadata";
import Link from "next/link";
import {FileText,Info,Mail} from "lucide-react";
export const metadata = publicMetadata("/privacy", "Privacy Notice | Legal Review Pending", "BlinkMyAd privacy notice preview. The final policy awaits legal approval.");
export default function Page(){return <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><span className="inline-flex items-center gap-2 rounded-full border border-warning-border bg-warning-bg px-4 py-2 text-sm font-semibold text-warning-fg"><Info className="size-4"/> Legal approval pending</span>
 <h1 className="mt-5 font-heading text-3xl font-bold text-ink sm:text-4xl">Privacy Notice</h1>
 <p className="mt-4 text-base leading-7 text-ink-muted">This page is a preview. It is not BlinkMyAd’s final privacy policy. Legal review and verified operating details are required before real customer, driver or payment data is collected.</p>
 <div className="mt-8 space-y-5 rounded-lg border border-line bg-surface p-6"><h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-ink"><FileText className="size-6 text-signal"/> What the platform does today</h2>
 <p className="text-sm leading-7 text-ink-muted">Accounts are stored on BlinkMyAd’s servers: your name, email address and role, and for driver partners the application details you enter. Signing in uses a secure session cookie. The contact form opens a message in your own email app; it isn’t sent to an BlinkMyAd server. Online payments, identity document checks and payouts are not switched on.</p>
 <p className="text-sm leading-7 text-ink-muted">Account registration, KYC, payments, analytics, cookies, data retention, sharing and user rights require a separate legally reviewed policy based on production practices.</p></div>
 <Link href="/contact" className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-signal hover:underline"><Mail className="size-4"/> Contact regarding privacy</Link></div>;}
