import { publicMetadata } from "@/config/public-metadata";
import Link from "next/link";
import {FileCheck2,Info} from "lucide-react";
export const metadata = publicMetadata("/terms", "Terms & Conditions | Legal Review Pending", "BlinkMyAd terms preview, pending commercial and legal approval.");
export default function Page(){return <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6"><span className="inline-flex items-center gap-2 rounded-full border border-warning-border bg-warning-bg px-4 py-2 text-sm font-semibold text-warning-fg"><Info className="size-4"/> Legal approval pending</span>
 <h1 className="mt-5 font-heading text-3xl font-bold text-ink sm:text-4xl">Terms & Conditions</h1>
 <p className="mt-4 text-base leading-7 text-ink-muted">Final advertiser and driver partner terms have not yet been supplied or approved. This page is a preview, not an operative agreement or an offer of guaranteed availability, revenue or earnings.</p>
 <div className="mt-8 space-y-5 rounded-lg border border-line bg-surface p-6"><h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-ink"><FileCheck2 className="size-6 text-signal"/> Commercial terms awaiting confirmation</h2>
 <p className="text-sm leading-7 text-ink-muted">Before production, the platform needs approved conditions for campaign bookings and cancellation, content approval, pricing and taxes, installation, partner participation, settlements, support and disputes.</p>
 <p className="text-sm leading-7 text-ink-muted">Prices and locations on the public site are indicative until rates are approved. Accounts can be created, but online payments, refunds and driver payouts are not switched on.</p></div>
 <Link href="/contact" className="mt-6 inline-flex min-h-11 items-center font-bold text-signal hover:underline">Contact about terms →</Link></div>;}
