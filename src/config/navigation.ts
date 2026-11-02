import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Banknote, Bell, CalendarDays, CircleHelp, Clapperboard, ClipboardCheck,
  CreditCard, FileChartColumnIncreasing, House, LayoutGrid, MapPinned, Megaphone,
  Monitor, MonitorCheck, Paintbrush, ReceiptText, Settings, SlidersHorizontal,
  Users, UserRound, Wallet, Wrench, CarFront, ListVideo, Clock3, ListChecks,
  ChartNoAxesCombined } from "lucide-react";

export type PortalRole = "admin" | "advertiser" | "driver";
export type NavItem = { label: string; href: string; icon: LucideIcon; description: string; group?: "main" | "management" | "account"; keywords?: string[] };
export const portalNames: Record<PortalRole,string> = { admin: "Admin Portal", advertiser: "Advertiser Portal", driver: "Driver Partner Portal" };
export const portalPeople: Record<PortalRole,{name:string;subtitle:string;initials:string}> = {
  admin:{name:"Admin",subtitle:"Authenticated Admin",initials:"A"},
  advertiser:{name:"Advertiser",subtitle:"Campaign workspace",initials:"AD"},
  driver:{name:"Driver Partner",subtitle:"Partner workspace",initials:"DP"},
};
export const portalNavigation: Record<PortalRole,NavItem[]> = {
  admin:[
    {label:"Dashboard",href:"/admin",icon:House,description:"Platform activity and confirmed money"},
    {label:"Campaigns",href:"/admin/campaigns",icon:Megaphone,description:"Campaign review queue"},
    {label:"Advertisers",href:"/admin/advertisers",icon:Users,description:"Advertiser accounts"},
    {label:"Driver partners",href:"/admin/drivers",icon:CarFront,description:"Driver applications and documents",keywords:["applications","kyc"]},
    {label:"Screens and devices",href:"/admin/screens",icon:MonitorCheck,description:"Registered screens and their locations"},
    {label:"Locations and zones",href:"/admin/locations",icon:MapPinned,description:"Cities, zones and locations"},
    {label:"Ad formats and rules",href:"/admin/ad-formats",icon:Clapperboard,description:"Supported ad formats"},
    {label:"Pricing",href:"/admin/pricing",icon:SlidersHorizontal,description:"Screen-day rates and tax policies"},
    {label:"Approvals",href:"/admin/approvals",icon:ClipboardCheck,description:"Campaign, creative and driver review"},
    {label:"Bookings and schedule",href:"/admin/bookings",icon:CalendarDays,description:"Bookings for approved campaigns"},
    {label:"Payments and refunds",href:"/admin/payments",icon:CreditCard,description:"Payment attempts and reconciliation",group:"management"},
    {label:"Driver settlements",href:"/admin/settlements",icon:Banknote,description:"Driver payouts (not switched on)",group:"management"},
    {label:"Reports",href:"/admin/analytics",icon:ChartNoAxesCombined,description:"Activity report and CSV downloads",group:"management"},
    {label:"Users and roles",href:"/admin/users",icon:UserRound,description:"Accounts and account status",group:"management"},
    {label:"Audit history",href:"/admin/audit",icon:ReceiptText,description:"Audit log and CSV download",group:"management"},
    {label:"Notifications",href:"/admin/notifications",icon:Bell,description:"Your notifications",group:"account"},
    {label:"Support and disputes",href:"/admin/support",icon:CircleHelp,description:"Support tickets",group:"account"},
    {label:"Settings",href:"/admin/settings",icon:Settings,description:"Security and integration status",group:"account"},
  ],
  advertiser:[
    {label:"Dashboard",href:"/advertiser",icon:House,description:"Campaign and reach overview"},
    {label:"Create campaign",href:"/advertiser/create-campaign",icon:Megaphone,description:"Six-step campaign creation and checkout",keywords:["wizard","new campaign"]},
    {label:"My campaigns",href:"/advertiser/campaigns",icon:ListVideo,description:"Active, completed and draft campaigns"},
    {label:"Ad formats",href:"/advertiser/ad-formats",icon:LayoutGrid,description:"Screen formats and specifications"},
    {label:"Locations",href:"/advertiser/locations",icon:MapPinned,description:"Browse Prayagraj areas and published screens"},
    {label:"Creative library",href:"/advertiser/creatives",icon:Paintbrush,description:"Organize creative metadata and preview local media"},
    {label:"Billing and payments",href:"/advertiser/billing",icon:Wallet,description:"Account payment attempts and checkout readiness",group:"management"},
    {label:"Reports",href:"/advertiser/reports",icon:FileChartColumnIncreasing,description:"Account campaign summaries and CSV export",group:"management"},
    {label:"Notifications",href:"/advertiser/notifications",icon:Bell,description:"Campaign, creative and billing alerts",group:"account"},
    {label:"Help and support",href:"/advertiser/support",icon:CircleHelp,description:"Help guides and support requests",group:"account"},
    {label:"Profile and settings",href:"/advertiser/settings",icon:Settings,description:"Business details and account preferences",group:"account"},
  ],
  driver:[
    {label:"Today",href:"/driver",icon:House,description:"Assigned work, screen information and partner notices"},
    {label:"Onboarding",href:"/driver/onboarding",icon:ListChecks,description:"Partner application and review steps"},
    {label:"Verification status",href:"/driver/verification",icon:BadgeCheck,description:"View verification review status"},
    {label:"Vehicle and screen",href:"/driver/vehicle",icon:CarFront,description:"Driver-owned vehicle, read-only screens and booking links"},
    {label:"Assigned ads",href:"/driver/assigned-ads",icon:Megaphone,description:"Assigned campaign dates and ad schedules"},
    {label:"Campaigns",href:"/driver/campaigns",icon:Clapperboard,description:"Filter campaigns by confirmed assignments"},
    {label:"Earnings",href:"/driver/earnings",icon:Wallet,description:"Reviewed earnings information and monthly totals",group:"management"},
    {label:"Payout history",href:"/driver/payouts",icon:ReceiptText,description:"Provider-confirmed payout history when available",group:"management"},
    {label:"Screen activity",href:"/driver/delivery",icon:Monitor,description:"Booked campaigns; verified playback not connected",group:"management"},
    {label:"Trips",href:"/driver/trips",icon:Clock3,description:"Real GPS and exposure data not yet connected",group:"management"},
    {label:"Maintenance and issues",href:"/driver/maintenance",icon:Wrench,description:"Report issues against assigned devices",group:"management"},
    {label:"Notifications",href:"/driver/notifications",icon:Bell,description:"Account-owned notices and read-state controls",group:"account"},
    {label:"Support",href:"/driver/support",icon:CircleHelp,description:"Driver support tickets and questions",group:"account"},
    {label:"Profile and documents",href:"/driver/profile",icon:UserRound,description:"Account identity and document review states",group:"account"},
  ],
};
export const publicNavigation = [
  {label:"Home",href:"/"},
  {label:"For advertisers",href:"/for-advertisers",children:[
    {label:"How advertising works",href:"/for-advertisers"},
    {label:"Ad formats",href:"/ad-formats"},
    {label:"Pricing",href:"/pricing"},
  ]},
  {label:"For drivers",href:"/for-drivers",children:[
    {label:"How partnering works",href:"/for-drivers"},
    {label:"Apply as a driver",href:"/signup?role=driver"},
    {label:"Help centre",href:"/help-center"},
  ]},
  {label:"Ad formats",href:"/ad-formats"},
  {label:"Locations",href:"/locations"},
  {label:"Pricing",href:"/pricing"},
  {label:"About",href:"/about"},
  {label:"Contact",href:"/contact"},
  {label:"Help centre",href:"/help-center"},
] as const;

export function activePortalItem(role:PortalRole,pathname:string) {
  const items=portalNavigation[role];
  return items.find(i=>pathname===i.href) ?? [...items].sort((a,b)=>b.href.length-a.href.length)
    .find(i=>pathname.startsWith(i.href+"/")) ?? items[0];
}
export function findPortalSection(role:PortalRole,slug:string) {
  return portalNavigation[role].find(i=>i.href==="/"+role+"/"+slug);
}
