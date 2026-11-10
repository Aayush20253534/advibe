"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BarChart3, CheckCircle2, ChevronRight,
  Clock3, FileImage, Layers3, MapPin, Megaphone, Pencil, Play,
  Plus, Search, Upload
} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {
  useAuth,useCollection,formatDate,Notice,
  type Campaign,type Creative,type Site
} from "./common";

const formats=[
 {id:"bike_rear",label:"Bike LED screens",src:"/images/blinkmyad/ad-formats/bike-rear.webp",desc:"Bike-mounted displays"},
 {id:"car_interior",label:"In-car screens",src:"/images/blinkmyad/ad-formats/car-interior.webp",desc:"Passenger facing"},
 {id:"auto_rear",label:"Auto rear screens",src:"/images/blinkmyad/ad-formats/auto-rear.webp",desc:"City mobility"},
 {id:"helmet",label:"Helmet ads",src:"/images/blinkmyad/ad-formats/helmet.webp",desc:"Branded helmet wraps"},
 {id:"car_rear",label:"Car rear screens",src:"/images/blinkmyad/ad-formats/car-rear.webp",desc:"Vehicle rear displays"},
 {id:"auto_side",label:"Auto side ads",src:"/images/blinkmyad/ad-formats/auto-side.webp",desc:"On-road advertising"}
] as const;
function formatOf(placement:string|undefined){
 return formats.find(f=>f.id===placement)??formats[0];
}
function Kpi({icon:Icon,tone,label,value,sub}:{icon:LucideIcon;tone?:"purple"|"green"|"orange";label:string;value:string|number;sub:string}){
 return <div className="bma-ref-kpi"><div className={"bma-ref-kpi-icon "+(tone??"")}><Icon size={23} strokeWidth={2.2} aria-hidden="true"/></div>
 <div className="bma-ref-kpi-copy"><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div>;
}
function Status({value}:{value:string}){
 const labels:Record<string,string>={draft:"Draft",submitted:"In review",changes_requested:"Changes requested",approved:"Approved",rejected:"Rejected",cancelled:"Cancelled"};
 return <span className="bma-ref-status" data-status={value}>{labels[value]??value.replaceAll("_"," ")}</span>;
}
function QuickActions(){
 const links=[
  {href:"/advertiser/create-campaign",title:"Create new campaign",sub:"Plan your next campaign",icon:Megaphone},
  {href:"/advertiser/creatives",title:"Upload media",sub:"Prepare images or videos",icon:Upload},
  {href:"/advertiser/ad-formats",title:"Explore ad formats",sub:"Choose your placement",icon:Layers3},
  {href:"/advertiser/locations",title:"Explore locations",sub:"See published areas",icon:MapPin}
 ];
 return <div className="bma-ref-section bma-ref-quick-actions"><h2>Quick Actions</h2>
 {links.map(item=><Link key={item.href} className="bma-ref-quick-link" href={item.href}>
  <span><item.icon size={18} aria-hidden="true"/></span><span><strong>{item.title}</strong><small>{item.sub}</small></span>
  <ChevronRight size={14} aria-hidden="true"/></Link>)}</div>;
}
function CampaignRows({rows,creatives,extended=false}:{rows:Campaign[];creatives:Creative[];extended?:boolean}){
 return <div className="bma-ref-table-scroll" role="region" aria-label="Campaign records" tabIndex={0}>
 <table className="bma-ref-table"><thead><tr><th>Campaign</th><th>Format</th><th>Schedule</th>{extended&&<th>Updated</th>}<th>Status</th><th>Actions</th></tr></thead>
 <tbody>{rows.map(row=>{
  const creative=creatives.find(c=>c.id===row.creativeId);
  const format=formatOf(creative?.placement);
  return <tr key={row.id}>
   <td><div className="bma-ref-title-cell"><Image src={format.src} alt="" width={53} height={46} className="bma-ref-thumb"/>
    <span><Link href={"/advertiser/campaigns/"+row.id}><strong>{row.title}</strong></Link><small>{creative?.title??"Creative not available"}</small></span></div></td>
   <td>{creative?format.label:"Not available"}</td>
   <td style={{whiteSpace:"nowrap"}}>{formatDate(row.startDate)}<small style={{display:"block",marginTop:3,color:"#8293a9"}}>to {formatDate(row.endDate)}</small></td>
   {extended&&<td>{formatDate(row.updatedAt)}</td>}
   <td><Status value={row.status}/></td>
   <td><Link href={"/advertiser/campaigns/"+row.id} title={"View "+row.title}>{["draft","changes_requested"].includes(row.status)?<Pencil size={15} aria-hidden="true"/>:<ChevronRight size={16} aria-hidden="true"/>}<span className="sr-only">View campaign details for {row.title}</span></Link></td>
  </tr>;
 })}</tbody></table></div>;
}
function ActivityPlot({campaigns}:{campaigns:Campaign[]}){
 const [range,setRange]=React.useState(30);
 const [today]=React.useState(()=>new Date());
 const count=React.useMemo(()=>{
  const length=range===7?7:range===30?6:9;
  const days=range/length;
  const dates=Array.from({length},(_,index)=>{
   const end=new Date(today);end.setDate(end.getDate()-Math.round((length-1-index)*days));
   const start=new Date(end);start.setDate(start.getDate()-Math.round(days));
   return {label:end.toLocaleDateString("en-IN",{day:"numeric",month:"short"}),value:campaigns.filter(c=>{
    const date=new Date(c.createdAt);
    return date>start&&date<=end;
   }).length};
  });
  return dates;
 },[range,today,campaigns]);
 const max=Math.max(1,...count.map(c=>c.value));
 return <section className="bma-ref-section bma-ref-performance">
  <div className="bma-ref-performance-head"><h2>Campaign activity</h2>
   <div className="bma-ref-range-buttons" aria-label="Activity date range">{[7,30,90].map(day=>
    <button key={day} type="button" aria-pressed={range===day} onClick={()=>setRange(day)}>{day}D</button>
   )}</div></div>
  <div className="bma-ref-plot" role="img" aria-label={count.map(c=>c.label+": "+c.value+" campaigns").join(", ")}>
   {count.map((item,i)=><div key={i} className="bma-ref-plot-bar" style={{height:"100%"}} title={item.value+" campaigns"}>
    <span style={{height:Math.max(3,item.value/max*100)+"%"}}/></div>)}
  </div>
  <div className="bma-ref-plot-caption"><span>{count[0]?.label}</span><span>{count.reduce((n,c)=>n+c.value,0)} created</span><span>{count[count.length-1]?.label}</span></div>
  <p className="bma-ref-performance-note">Actual campaign records created in the selected period. Impressions, clicks and audience reach are not available in this workspace.</p>
 </section>;
}
export function ReferenceDashboard(){
 const {business,businesses}=useAuth();
 const list=useCollection<Campaign>(business?"/campaigns?limit=100&businessId="+business.id:null);
 const creatives=useCollection<Creative>(business?"/creatives?limit=100&businessId="+business.id:null);
 const sites=useCollection<Site>("/public/locations?citySlug=prayagraj&limit=100");
 const rows=[...list.rows].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 const inReview=list.rows.filter(c=>c.status==="submitted").length;
 const approved=list.rows.filter(c=>c.status==="approved").length;
 const ready=creatives.rows.filter(c=>c.approval==="approved").length;
 const pending=list.busy||creatives.busy;
 const availableValues=(value:number)=>pending?"…":value.toLocaleString("en-IN");
 return <div className="space-y-4">
  {list.error&&<Notice kind="error">{list.error}</Notice>}{creatives.error&&<Notice kind="error">{creatives.error}</Notice>}
  {!business&&<Notice kind="warning">Add a business in Profile &amp; Settings to start managing campaigns.</Notice>}
  <div className="bma-ref-kpi-grid">
   <Kpi icon={Megaphone} label="Total campaigns" value={availableValues(list.rows.length)} sub="Saved campaigns"/>
   <Kpi icon={Clock3} tone="purple" label="In review" value={availableValues(inReview)} sub="Awaiting review"/>
   <Kpi icon={CheckCircle2} tone="green" label="Approved campaigns" value={availableValues(approved)} sub="Approved by the platform"/>
   <Kpi icon={FileImage} tone="orange" label="Ready creatives" value={availableValues(ready)} sub={pending?"Loading":creatives.rows.length+" uploaded records"}/>
  </div>
  <div className="bma-ref-dashboard-top">
   <section className="bma-ref-featured">
    <Image fill priority alt="Motorbike-mounted advertising display" sizes="(max-width: 740px) 100vw, 55vw" src="/images/blinkmyad/ad-formats/bike-rear.webp"/>
    <div className="bma-ref-featured-content"><span>FEATURED AD FORMAT</span><h2>Bike-mounted advertising screens</h2><p>High visibility. Mobile reach. Flexible location planning.</p>
     <Link href="/advertiser/ad-formats">Explore formats <ArrowRight size={16} aria-hidden="true"/></Link></div>
   </section>
   <QuickActions/>
   <ActivityPlot campaigns={rows}/>
  </div>
  <div className="bma-ref-dashboard-bottom">
   <section className="bma-ref-section"><div className="bma-ref-section-head"><div><h2>Recent Campaigns</h2><p>Latest records for your selected business</p></div><Link href="/advertiser/campaigns">View all <ArrowRight size={13}/></Link></div>
    {list.busy?<p className="bma-ref-empty">Loading campaigns…</p>:rows.length?<CampaignRows rows={rows.slice(0,6)} creatives={creatives.rows}/>:<div className="bma-ref-empty">No campaigns created yet. <Link href="/advertiser/create-campaign">Create your first campaign</Link>.</div>}
   </section>
   <section className="bma-ref-section"><div className="bma-ref-section-head"><div><h2>Published Locations</h2><p>Currently listed areas</p></div><Link href="/advertiser/locations">View all <ArrowRight size={13}/></Link></div>
    <div className="bma-ref-mini-list">{sites.busy?<p className="bma-ref-empty">Loading areas…</p>:sites.rows.length?sites.rows.slice(0,6).map(site=><div key={site.id}><MapPin size={15} color="#0871f4"/><strong>{site.name}</strong><span>{site.city}</span></div>):<p className="bma-ref-empty">No published areas available.</p>}</div>
    {sites.error&&<p className="bma-ref-footnote" style={{padding:"0 15px 14px"}}>{sites.error}</p>}
   </section>
   <section className="bma-ref-section"><div className="bma-ref-section-head"><div><h2>Creative library</h2><p>Recently uploaded records</p></div><Link href="/advertiser/creatives">View all <ArrowRight size={13}/></Link></div>
    <div className="bma-ref-media-grid">{creatives.rows.slice(0,4).map(c=><Link key={c.id} href="/advertiser/creatives" className="bma-ref-media-card">
      <Image src={formatOf(c.placement).src} width={180} height={100} alt={"Format illustration: "+formatOf(c.placement).label}/>
      <p>{c.title}</p></Link>)}</div>
    {!creatives.busy&&!creatives.rows.length&&<div className="bma-ref-empty">No media records uploaded yet.</div>}
   </section>
  </div>
  <section className="bma-ref-section bma-ref-studio-strip"><h2>Explore advertising formats <span style={{fontSize:11,fontWeight:400,color:"#768baa"}}>· Creative setup available in your library</span></h2>
   <div className="bma-ref-studio-items">{formats.map(f=><Link key={f.id} href="/advertiser/ad-formats"><Image src={f.src} width={150} height={74} alt={f.label}/><span>{f.label}</span></Link>)}</div>
  </section>
  <p className="bma-ref-footnote">All dashboard counts reflect the loaded records, up to 100 campaigns and 100 creatives, for {business?.displayName??"your selected business"}{businesses.length>1?" (one of "+businesses.length+" businesses)":""}. Illustrations show ad formats, not user-uploaded artwork or confirmed delivery.</p>
 </div>;
}
const filters=[
 {id:"",label:"All"},{id:"approved",label:"Approved"},{id:"submitted",label:"In review"},
 {id:"draft",label:"Drafts"},{id:"changes_requested",label:"Changes requested"},
 {id:"rejected",label:"Rejected"},{id:"cancelled",label:"Cancelled"}
];
export function ReferenceCampaigns(){
 const {business}=useAuth();
 const [status,setStatus]=React.useState("");
 const [search,setSearch]=React.useState("");
 const [sort,setSort]=React.useState("newest");
 const list=useCollection<Campaign>(business?"/campaigns?limit=100&businessId="+business.id:null);
 const creatives=useCollection<Creative>(business?"/creatives?limit=100&businessId="+business.id:null);
 const metrics={
  total:list.rows.length,
  approved:list.rows.filter(c=>c.status==="approved").length,
  review:list.rows.filter(c=>c.status==="submitted").length,
  draft:list.rows.filter(c=>c.status==="draft").length
 };
 const visible=list.rows.filter(c=>(!status||c.status===status)&&c.title.toLowerCase().includes(search.trim().toLowerCase()))
  .sort((a,b)=>sort==="oldest"?a.createdAt.localeCompare(b.createdAt):b.createdAt.localeCompare(a.createdAt));
 return <div className="space-y-4">
  <div className="bma-ref-kpi-grid">
   <Kpi icon={Megaphone} label="Total campaigns" value={list.busy?"…":metrics.total} sub="Loaded records"/>
   <Kpi icon={Play} tone="green" label="Approved campaigns" value={list.busy?"…":metrics.approved} sub="Approved for next steps"/>
   <Kpi icon={Clock3} tone="orange" label="In review" value={list.busy?"…":metrics.review} sub="Awaiting platform review"/>
   <Kpi icon={Layers3} tone="purple" label="Saved drafts" value={list.busy?"…":metrics.draft} sub="Not submitted"/>
  </div>
  <div className="bma-ref-campaign-layout">
   <section className="bma-ref-section">
    <div className="bma-ref-section-head"><div><h2>Manage your campaigns</h2><p>Search, review, and edit campaigns for your selected business</p></div>
     <Link href="/advertiser/create-campaign" className="bma-ref-btn-primary"><Plus size={15}/> New campaign</Link></div>
    <div className="bma-ref-filterbar"><Search size={17} color="#6e88ac"/>
     <input aria-label="Search campaigns by name" placeholder="Search campaigns by name..." value={search} onChange={e=>setSearch(e.target.value)}/>
     <select aria-label="Filter campaign status" value={status} onChange={e=>setStatus(e.target.value)}>{filters.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}</select>
     <select aria-label="Sort campaigns" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
    </div>
    <div className="bma-ref-tabs" aria-label="Campaign status tabs">{filters.map(f=><button type="button" key={f.id} aria-pressed={status===f.id} onClick={()=>setStatus(f.id)}>{f.label} ({f.id?list.rows.filter(c=>c.status===f.id).length:list.rows.length})</button>)}</div>
    {list.error&&<Notice kind="error">{list.error}</Notice>}{creatives.error&&<Notice kind="error">{creatives.error}</Notice>}
    {list.busy?<p className="bma-ref-empty">Loading campaign records…</p>:visible.length?<CampaignRows rows={visible} creatives={creatives.rows} extended/>:<div className="bma-ref-empty">No campaigns match your filters. {list.rows.length===0?<Link href="/advertiser/create-campaign">Create a campaign draft</Link>:"Change your search or status."}</div>}
    <div className="bma-ref-pagination"><span>Showing {visible.length} of {list.rows.length} loaded campaign{list.rows.length===1?"":"s"}</span>
     <div style={{display:"flex",gap:8}}><button type="button" disabled={!list.hasPrevious||list.busy} onClick={list.first}>First page</button><button type="button" disabled={!list.next||list.busy} onClick={list.more}>Next page</button></div></div>
   </section>
   <aside className="bma-ref-campaign-sidebar">
    <div className="bma-ref-stats-banner"><BarChart3 size={26} color="#70b5ff"/><h3>Your Campaigns<br/>Make an Impact</h3><strong>{list.busy?"…":metrics.total}</strong><p>Campaigns loaded for this business. Performance reach data is not connected.</p></div>
    <QuickActions/>
    <div className="bma-ref-section" style={{overflow:"hidden"}}>
     <Image src="/images/blinkmyad/ad-formats/bike-rear.webp" alt="Motorbike advertising example" width={600} height={250} style={{width:"100%",height:145,objectFit:"cover"}}/>
     <div style={{padding:15}}><h3 style={{fontWeight:800,fontSize:15}}>Need more reach?</h3><p style={{margin:"8px 0 12px",color:"#6b7e96",fontSize:11,lineHeight:1.6}}>Explore new formats and published advertising locations.</p>
      <Link className="bma-ref-btn-light" href="/advertiser/ad-formats">Explore formats <ArrowRight size={14}/></Link></div>
    </div>
    <section className="bma-ref-section" style={{padding:17}}><h3 style={{fontSize:14,fontWeight:800}}>Need help?</h3><p style={{fontSize:11,color:"#7489a5",margin:"7px 0 14px",lineHeight:1.6}}>Our team can help you plan and review campaigns.</p><Link className="bma-ref-btn-light" href="/advertiser/support">Contact support <ArrowRight size={13}/></Link></section>
   </aside>
  </div>
  <p className="bma-ref-footnote">Status and dates come from your campaign records. Format images are illustrations. Pagination loads up to 100 records per page; no impressions, spend or delivery estimates are inferred.</p>
 </div>;
}
