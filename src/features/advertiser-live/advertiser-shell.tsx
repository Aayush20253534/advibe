"use client";

import * as React from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {
  Bell, ChevronDown, ChevronRight, CircleHelp, LogOut, Menu,
  Search, X, ArrowRight
} from "lucide-react";
import {BrandLogo} from "@/components/brand/brand-logo";
import {portalNavigation} from "@/config/navigation";
import {api} from "@/services/api-client";

type Props={
  title:string;description?:React.ReactNode;actions?:React.ReactNode;
  context?:React.ReactNode;onSignOut:()=>void;children:React.ReactNode;
};
const nav=portalNavigation.advertiser;
const primary=nav.filter(x=>!x.group);
const management=nav.filter(x=>x.group==="management");
const account=nav.filter(x=>x.group==="account");
function SideLinks({items,pathname,onNavigate}:{items:typeof nav;pathname:string;onNavigate:()=>void}){
 return <ul className="bma-ref-menu-list">{items.map(item=>{
  const active=pathname===item.href||(item.href!=="/advertiser"&&pathname.startsWith(item.href+"/"));
  const Icon=item.icon;
  return <li key={item.href}><Link href={item.href} onClick={onNavigate} aria-current={active?"page":undefined} className="bma-ref-menu-link" data-active={active?"true":undefined}>
   <Icon size={19} strokeWidth={1.9} aria-hidden="true"/><span>{item.label==="Creative library"?"Design Studio & media":item.label}</span>
  </Link></li>;
 })}</ul>;
}
function Sidebar({pathname,close}:{pathname:string;close:()=>void}){
 return <div className="bma-ref-sidebar-inner">
  <div className="bma-ref-logo"><BrandLogo href="/advertiser" inverse width={172}/><span>Advertiser workspace</span></div>
  <nav aria-label="Advertiser navigation" className="bma-ref-sidebar-nav">
   <SideLinks items={primary} pathname={pathname} onNavigate={close}/>
   <p className="bma-ref-nav-caption">MANAGEMENT</p>
   <SideLinks items={management} pathname={pathname} onNavigate={close}/>
   <p className="bma-ref-nav-caption">ACCOUNT</p>
   <SideLinks items={account} pathname={pathname} onNavigate={close}/>
  </nav>
  <Link href="/advertiser/create-campaign" onClick={close} className="bma-ref-side-promo">
   <span className="bma-ref-side-promo-kicker">GROW YOUR BRAND</span>
   <strong>Take your next campaign further.</strong>
   <small>Reach people where they travel, shop and live.</small>
   <span className="bma-ref-side-promo-cta">Create campaign <ArrowRight size={14} aria-hidden="true"/></span>
  </Link>
  <div className="bma-ref-side-copyright">© {new Date().getFullYear()} BlinkMyAd</div>
 </div>;
}
export function AdvertiserReferenceShell({title,description,actions,context,onSignOut,children}:Props){
 const pathname=usePathname(),router=useRouter();
 const [mobileOpen,setMobileOpen]=React.useState(false);
 const [accountOpen,setAccountOpen]=React.useState(false);
 const [query,setQuery]=React.useState("");
 const [searchOpen,setSearchOpen]=React.useState(false);
 const [displayName,setDisplayName]=React.useState("Advertiser");
 const [greeting,setGreeting]=React.useState("Welcome back");
 React.useEffect(()=>{
  const hour=new Date().getHours();
  setGreeting(hour<12?"Good morning":hour<17?"Good afternoon":"Good evening");
  let active=true;
  void api<{displayName?:string}>("/me").then(profile=>{if(active&&profile.displayName)setDisplayName(profile.displayName);}).catch(()=>{});
  return ()=>{active=false;};
 },[]);
 React.useEffect(()=>{setMobileOpen(false);setSearchOpen(false);setAccountOpen(false);},[pathname]);
 React.useEffect(()=>{
  if(!mobileOpen)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const key=(event:KeyboardEvent)=>{if(event.key==="Escape")setMobileOpen(false);};
  window.addEventListener("keydown",key);
  return ()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",key);};
 },[mobileOpen]);
 const results=React.useMemo(()=>{
  const q=query.trim().toLowerCase();
  if(!q)return [];
  return nav.filter(item=>[item.label,item.description,...(item.keywords??[])].some(value=>value.toLowerCase().includes(q))).slice(0,6);
 },[query]);
 const go=(href:string)=>{setSearchOpen(false);setQuery("");router.push(href);};
 const initials=displayName.trim().split(/\s+/).slice(0,2).map(x=>x.charAt(0)).join("").toUpperCase()||"AD";
 const isDashboard=pathname==="/advertiser";
 return <div className="bma-advertiser-portal bma-reference-portal" data-portal="advertiser" data-portal-page={pathname}>
  <a className="bma-ref-skip" href="#advertiser-content">Skip to content</a>
  <aside className="bma-ref-sidebar"><Sidebar pathname={pathname} close={()=>setMobileOpen(false)}/></aside>
  {mobileOpen&&<div className="bma-ref-mobile-layer">
   <button className="bma-ref-mobile-backdrop" type="button" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>
   <aside className="bma-ref-mobile-sidebar"><button className="bma-ref-mobile-close" type="button" aria-label="Close menu" onClick={()=>setMobileOpen(false)}><X size={20}/></button><Sidebar pathname={pathname} close={()=>setMobileOpen(false)}/></aside>
  </div>}
  <div className="bma-ref-workspace">
   <header className="bma-ref-topbar">
    <button type="button" className="bma-ref-mobile-trigger" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={()=>setMobileOpen(true)}><Menu size={21}/></button>
    <div className="bma-ref-search-box">
     <Search size={18} aria-hidden="true"/>
     <form role="search" onSubmit={e=>{e.preventDefault();if(results[0])go(results[0].href);}}>
      <input type="search" aria-label="Search advertiser pages" value={query} onChange={e=>{setQuery(e.target.value);setSearchOpen(true);}} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==="Escape")setSearchOpen(false);}} placeholder="Search campaigns, locations, or formats..."/>
     </form>
     {searchOpen&&query.trim()&&<div className="bma-ref-search-results" role="listbox" aria-label="Search matches">
       {results.length?results.map(item=><button type="button" role="option" aria-selected="false" key={item.href} onClick={()=>go(item.href)}>
        <item.icon size={16} aria-hidden="true"/><span>{item.label}</span><ChevronRight size={15} aria-hidden="true"/>
       </button>):<p>No matching pages</p>}
     </div>}
    </div>
    <div className="bma-ref-topbar-actions">
     <Link href="/advertiser/notifications" className="bma-ref-bell" aria-label="Notifications"><Bell size={21}/></Link>
     <span className="bma-ref-topbar-separator"/>
     <div className="bma-ref-account-wrap">
      <button type="button" className="bma-ref-account" aria-expanded={accountOpen} aria-controls="bma-ref-account-menu" onClick={()=>setAccountOpen(x=>!x)}>
       <span className="bma-ref-avatar">{initials}</span>
       <span className="bma-ref-account-copy"><strong>{displayName}</strong><small>Advertiser</small></span><ChevronDown size={15} aria-hidden="true"/>
      </button>
      {accountOpen&&<div id="bma-ref-account-menu" className="bma-ref-account-menu">
       <Link href="/advertiser/settings" onClick={()=>setAccountOpen(false)}>Profile &amp; settings</Link>
       <Link href="/advertiser/support" onClick={()=>setAccountOpen(false)}><CircleHelp size={15} aria-hidden="true"/> Help &amp; support</Link>
       <button type="button" onClick={()=>{setAccountOpen(false);onSignOut();}}><LogOut size={16} aria-hidden="true"/> Sign out</button>
      </div>}
     </div>
    </div>
   </header>
   <main id="advertiser-content" tabIndex={-1} className="bma-ref-main">
    <div className="bma-ref-heading">
     <div className="bma-ref-heading-copy">
      <p className="bma-ref-crumb">BLINKMYAD / ADVERTISER WORKSPACE</p>
      <h1>{isDashboard?<>{greeting}, {displayName.split(" ")[0]}!</>:title}</h1>
      <p>{isDashboard?"Here's what's happening with your campaigns today.":description}</p>
     </div>
     <div className="bma-ref-heading-actions">{context}{actions}</div>
    </div>
    {children}
   </main>
  </div>
 </div>;
}
