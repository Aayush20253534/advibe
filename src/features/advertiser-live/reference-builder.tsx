"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {
  ArrowRight, CalendarDays, Check, ChevronRight, Clock3, FileImage,
  ImageUp, MapPin, Megaphone, MonitorPlay, Plus, Save, ShieldCheck,
  UploadCloud, Wallet
} from "lucide-react";
import {api,newIdempotencyKey} from "@/services/api-client";
import {useAuth,useCollection,formatDate,message,Notice,type Creative,type Campaign,type Site} from "./common";

const formatOptions=[
 {id:"bike_rear",label:"Bike mounted LED screens",image:"/images/blinkmyad/ad-formats/bike-rear.webp",description:"Mobile screen placement"},
 {id:"car_interior",label:"Car interior LED screens",image:"/images/blinkmyad/ad-formats/car-interior.webp",description:"In-vehicle audience"},
 {id:"auto_rear",label:"Auto rear screens",image:"/images/blinkmyad/ad-formats/auto-rear.webp",description:"Moving city visibility"},
 {id:"helmet",label:"Helmet advertising",image:"/images/blinkmyad/ad-formats/helmet.webp",description:"Branded helmet display"},
 {id:"car_rear",label:"Car rear screens",image:"/images/blinkmyad/ad-formats/car-rear.webp",description:"Rear window branding"},
 {id:"auto_side",label:"Auto side ads",image:"/images/blinkmyad/ad-formats/auto-side.webp",description:"Neighborhood visibility"}
] as const;
const weekdays=[["Sun",0],["Mon",1],["Tue",2],["Wed",3],["Thu",4],["Fri",5],["Sat",6]] as const;
function Section({number,title,description,id,children}:{number:number;title:string;description:string;id:string;children:React.ReactNode}){
 return <section id={id} className="bma-ref-section bma-ref-builder-section">
  <div className="bma-ref-builder-title"><b>{number}</b><div><h2>{title}</h2><p>{description}</p></div></div>{children}
 </section>;
}
function SummaryItem({icon:Icon,label,value}:{icon:typeof Megaphone;label:string;value:string}){
 return <div><Icon size={17} aria-hidden="true"/><div><span>{label}</span><strong>{value}</strong></div></div>;
}
export function ReferenceCampaignBuilder(){
 const router=useRouter();
 const {session,business}=useAuth();
 const creatives=useCollection<Creative>(business?"/creatives?limit=100&businessId="+business.id:null);
 const locations=useCollection<Site>("/public/locations?citySlug=prayagraj&limit=100");
 const [title,setTitle]=React.useState("");
 const [placement,setPlacement]=React.useState<string>("bike_rear");
 const [creativeId,setCreativeId]=React.useState("");
 const [startDate,setStartDate]=React.useState("");
 const [endDate,setEndDate]=React.useState("");
 const [fromTime,setFromTime]=React.useState("09:00");
 const [toTime,setToTime]=React.useState("21:00");
 const [days,setDays]=React.useState<number[]>([0,1,2,3,4,5,6]);
 const [busy,setBusy]=React.useState(false);
 const [error,setError]=React.useState("");
 const [attempted,setAttempted]=React.useState(false);
 const matching=creatives.rows.filter(c=>c.placement===placement);
 const chosen=creatives.rows.find(c=>c.id===creativeId);
 const format=formatOptions.find(f=>f.id===placement)??formatOptions[0];
 const datesValid=/^\d{4}-\d{2}-\d{2}$/.test(startDate)&&/^\d{4}-\d{2}-\d{2}$/.test(endDate)&&startDate<=endDate;
 const duration=datesValid?Math.round((Date.parse(endDate+"T00:00:00Z")-Date.parse(startDate+"T00:00:00Z"))/86400000)+1:0;
 const valid=Boolean(business&&title.trim()&&chosen&&days.length&&datesValid&&duration>=1&&duration<=60&&fromTime<toTime);
 const note=!title.trim()?"Enter a campaign name.":!chosen?"Select a creative matching the chosen format.":!datesValid?"Choose a valid start and end date.":duration>60?"Campaigns must last no more than 60 days.":!days.length?"Select at least one weekday.":fromTime>=toTime?"Daily end time must be after start time.":"";
 async function save(){
  setAttempted(true);setError("");
  if(!business||busy||!valid)return;
  setBusy(true);
  try{
   const created=await api<Campaign>("/campaigns",{method:"POST",csrfToken:session.csrfToken,idempotencyKey:newIdempotencyKey(),body:{
    businessId:business.id,creativeId,title:title.trim(),startDate,endDate,weekdays:days,timeWindow:{start:fromTime,end:toTime}
   }});
   router.push("/advertiser/campaigns/"+created.id);
  }catch(e){setError(message(e));}
  finally{setBusy(false);}
 }
 if(!business)return <Notice kind="warning">Register a business in <Link className="font-bold underline" href="/advertiser/settings">Profile &amp; settings</Link> before creating campaigns.</Notice>;
 return <div className="bma-ref-wizard-layout">
  <div className="bma-ref-wizard-main">
   <nav aria-label="Campaign creation sections" className="bma-ref-stepper">
    {[
     {label:"Campaign details",href:"#campaign-details"},
     {label:"Creative selection",href:"#campaign-creative"},
     {label:"Locations & screens",href:"#campaign-locations"},
     {label:"Schedule & review",href:"#campaign-schedule"}
    ].map((step,i)=><React.Fragment key={step.href}>{i>0&&<span className="bma-ref-step-line"/>}<a href={step.href} className="bma-ref-step" style={{textDecoration:"none"}}><b>{i+1}</b>{step.label}</a></React.Fragment>)}
   </nav>
   <Section number={1} id="campaign-details" title="Campaign Details" description="Name your campaign and choose a format for your advertising creative.">
    <div className="bma-ref-form-grid">
     <label>Campaign name *<input required maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Winter brand campaign"/></label>
     <label>Campaign goal<select defaultValue="awareness" aria-label="Campaign goal"><option value="awareness">Brand awareness</option></select></label>
     <label>Industry<input value={business.displayName} readOnly aria-label="Business running the campaign"/></label>
     <label>Target audience<select defaultValue="all" aria-label="Audience"><option value="all">General audience (planning)</option></select></label>
    </div>
    <p className="bma-ref-footnote" style={{marginTop:11}}>Business, placement, dates and creative are saved on the campaign. Goal, industry and audience are descriptive planning fields only; demographic targeting is not connected.</p>
   </Section>
   <Section number={2} id="campaign-formats" title="Choose Ad Format" description="Select the screen or vehicle format your creative was prepared for.">
    <div className="bma-ref-format-grid">{formatOptions.map(item=>
     <button type="button" key={item.id} aria-pressed={placement===item.id} data-selected={placement===item.id?"true":undefined} className="bma-ref-format-card" onClick={()=>{setPlacement(item.id);setCreativeId("");}}>
      <Image src={item.image} width={200} height={110} alt={item.label}/><span className="bma-ref-format-check">{placement===item.id?<Check size={14}/>:<Plus size={13}/>}</span>
      <strong>{item.label}</strong><small>{item.description}</small>
     </button>)}</div>
    <p className="bma-ref-footnote" style={{marginTop:12}}>Format selection filters available creative uploads. Screens and prices are confirmed later in the booking and quotation process.</p>
   </Section>
   <Section number={3} id="campaign-creative" title="Upload or Select Creative" description="Use an existing image or video for the selected format, or visit your creative library to upload media.">
    <div className="bma-ref-upload-hint">
     <div style={{display:"flex",alignItems:"center",gap:12}}><UploadCloud size={27} color="#1076f2" aria-hidden="true"/><p><strong style={{display:"block",fontSize:12,color:"#1e375a",marginBottom:4}}>Need to upload a new file?</strong>JPG, PNG and video files are handled in the creative library with review and processing.</p></div>
     <Link className="bma-ref-btn-primary" href="/advertiser/creatives"><ImageUp size={16} aria-hidden="true"/> Open creative library</Link>
    </div>
    {creatives.error&&<p className="bma-ref-error" role="alert" style={{marginTop:12}}>{creatives.error}</p>}
    {creatives.busy?<p className="bma-ref-footnote" style={{marginTop:14}}>Loading saved creatives…</p>:
     matching.length?<fieldset style={{marginTop:14}}><legend style={{fontSize:12,fontWeight:800}}>Choose a {format.label.toLowerCase()} creative *</legend>
      <div className="bma-ref-creative-list">{matching.map(c=><label className="bma-ref-creative-choice" key={c.id}>
       <input type="radio" name="creative" value={c.id} checked={creativeId===c.id} onChange={()=>setCreativeId(c.id)}/>
       <span><strong>{c.title}</strong><small>Review status: {c.approval.replaceAll("_"," ")}</small></span>
       {c.approval==="approved"&&<ShieldCheck size={17} color="#169d66" aria-label="Approved"/>}
      </label>)}</div>
     </fieldset>:<p className="bma-ref-footnote" style={{marginTop:13}}>No creatives for this format yet. Upload a creative in the library first, then return to this form.</p>}
   </Section>
   <Section number={4} id="campaign-locations" title="Select Location & Screens" description="Explore currently published areas before requesting placement availability.">
    <div className="bma-ref-form-grid">
     <label>Current pilot city<input value="Prayagraj" readOnly/></label>
     <label>Available location records<input value={locations.busy?"Loading…":String(locations.rows.length)} readOnly/></label>
    </div>
    <div className="bma-ref-city-info" style={{marginTop:13}}><MapPin size={22} color="#096af4" aria-hidden="true"/>
     <div>Published locations can be explored now. Specific screens, inventory holds and pricing are managed after campaign review. This form does not reserve screens.
      <Link href="/advertiser/locations" style={{display:"block",marginTop:5,color:"#0867f9",fontWeight:800}}>Explore published locations <ArrowRight size={12} style={{display:"inline"}}/></Link></div>
    </div>
    {locations.error&&<p className="bma-ref-footnote" style={{marginTop:8}}>{locations.error}</p>}
   </Section>
   <Section number={5} id="campaign-schedule" title="Schedule & Review" description="Set your flight dates and active display hours, then save your campaign as a draft.">
    <div className="bma-ref-form-grid">
     <label>Start date *<input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/></label>
     <label>End date *<input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}/></label>
     <label>Daily start time *<input type="time" value={fromTime} onChange={e=>setFromTime(e.target.value)}/></label>
     <label>Daily end time *<input type="time" value={toTime} onChange={e=>setToTime(e.target.value)}/></label>
    </div>
    <fieldset style={{marginTop:17}}><legend style={{fontSize:12,fontWeight:750}}>Active days *</legend>
     <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8}}>
      {weekdays.map(([label,day])=><label key={day} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,padding:"7px 9px",border:"1px solid #d7e4f5",borderRadius:6,background:days.includes(day)?"#ecf5ff":"#fff",cursor:"pointer"}}>
       <input type="checkbox" checked={days.includes(day)} onChange={e=>setDays(old=>e.target.checked?[...old,day].sort():old.filter(d=>d!==day))} style={{accentColor:"#096bfb"}}/>{label}
      </label>)}
     </div>
    </fieldset>
    <div className="bma-ref-city-info" style={{marginTop:16}}><Wallet size={19} color="#1672ee"/>Your final budget is not charged here. Review available screens, quotations and payments separately after approval. <Link style={{color:"#0968ec",fontWeight:750}} href="/advertiser/billing">Billing</Link></div>
    {attempted&&note&&<p className="bma-ref-validation" role="alert" style={{marginTop:12}}>{note}</p>}
    {error&&<p className="bma-ref-error" role="alert" style={{marginTop:12}}>{error}</p>}
    <div style={{display:"flex",gap:10,justifyContent:"flex-end",flexWrap:"wrap",borderTop:"1px solid #edf1f7",paddingTop:17,marginTop:18}}>
     <Link href="/advertiser/campaigns" className="bma-ref-btn-light">Back to campaigns</Link>
     <button type="button" className="bma-ref-btn-primary" onClick={()=>void save()} disabled={busy}><Save size={16}/>{busy?"Saving…":"Save campaign draft"}</button>
    </div>
   </Section>
  </div>
  <aside className="bma-ref-wizard-aside" aria-label="Campaign summary and actions">
   <div className="bma-ref-section bma-ref-summary">
    <h2>Campaign Summary</h2>
    <div className="bma-ref-summary-image"><Image src={format.image} alt={"Advertising format illustration: "+format.label} width={350} height={165}/></div>
    <strong style={{display:"block",marginTop:12,fontSize:13,color:"#172e51",overflowWrap:"anywhere"}}>{title.trim()||"Untitled campaign"}</strong>
    <span style={{fontSize:11,color:"#7086a2"}}>Draft · {business.displayName}</span>
    <div className="bma-ref-summary-list">
     <SummaryItem icon={Megaphone} label="Format" value={format.label}/>
     <SummaryItem icon={FileImage} label="Creative" value={chosen?.title??"Not selected"}/>
     <SummaryItem icon={MapPin} label="Pilot region" value="Prayagraj (planning only)"/>
     <SummaryItem icon={CalendarDays} label="Duration" value={datesValid?formatDate(startDate)+" – "+formatDate(endDate)+" ("+duration+" days)":"Select dates"}/>
     <SummaryItem icon={Clock3} label="Display hours" value={fromTime+" – "+toTime}/>
     <SummaryItem icon={Wallet} label="Estimated cost" value="Quote required"}/>
    </div>
    <div className="bma-ref-summary-actions">
     {attempted&&note&&<p className="bma-ref-validation" role="alert">{note}</p>}
     {error&&<p className="bma-ref-error" role="alert">{error}</p>}
     <button type="button" className="bma-ref-btn-primary" disabled={busy} onClick={()=>void save()}><Save size={16}/>{busy?"Saving draft…":"Save campaign draft"}</button>
     <Link href="/advertiser/creatives" className="bma-ref-btn-light"><ImageUp size={15}/> Manage creatives</Link>
    </div>
   </div>
   <div className="bma-ref-section" style={{padding:15,background:"#f1f7ff"}}>
    <ShieldCheck size={22} color="#0b66ef"/>
    <h3 style={{fontSize:13,fontWeight:800,margin:"8px 0"}}>Review before launch</h3>
    <p style={{fontSize:11,lineHeight:1.7,color:"#647b99"}}>Saving a draft does not book screens or charge money. Submit the draft for admin review from its campaign details once your creative is approved.</p>
    <Link href="/advertiser/support" style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:12,color:"#0964e9",fontWeight:800,fontSize:11}}>Contact support <ArrowRight size={13}/></Link>
   </div>
  </aside>
 </div>;
}
