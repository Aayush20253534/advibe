"use client";
import * as React from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {api,newIdempotencyKey} from "@/services/api-client";
import {useAuth,useCollection,Panel,Notice,CollectionNotice,Pagination,field,label,primary,secondary,message,formatDate,
 type Campaign,type Creative} from "./common";
const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function Badge({value}:{value:string}){return <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-800">{value.replaceAll("_"," ")}</span>;}
export function Dashboard(){
 const {business,businesses}=useAuth();
 const c=useCollection<Campaign>(business?"/campaigns?limit=100&businessId="+business.id:null);
 const creatives=useCollection<Creative>(business?"/creatives?limit=100&businessId="+business.id:null);
 const status=(v:string)=>c.rows.filter(x=>x.status===v).length;
 return <div className="space-y-5">
  <Notice>Dashboard metrics are counts of records fetched from your account, not verified impressions, reach or earnings. Counts cover the first 100 campaigns in the selected business.</Notice>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
   {[
    ["Businesses",businesses.length],["Campaigns",c.rows.length],["Submitted",status("submitted")],
    ["Approved",status("approved")]
   ].map(([name,count])=><div key={String(name)} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
     <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{name}</p>
     <p className="mt-3 text-3xl font-black text-[#0d315c]">{count}</p>
    </div>)}
  </div>
  <Panel title="Recent campaigns" action={<Link className={secondary} href="/advertiser/create-campaign">New campaign</Link>}>
   <CollectionNotice busy={c.busy||creatives.busy} error={c.error||creatives.error} length={c.rows.length}/>
   <div className="divide-y divide-slate-100">{c.rows.slice(0,6).map(item=><Link key={item.id} href={"/advertiser/campaigns/"+item.id} className="flex items-center justify-between gap-3 py-4 text-sm hover:text-blue-700">
    <div><p className="font-bold">{item.title}</p><p className="mt-1 text-xs text-slate-500">{formatDate(item.startDate)} to {formatDate(item.endDate)}</p></div>
    <Badge value={item.status}/>
   </Link>)}</div>
  </Panel>
  <Panel title="Creative review">
   <p className="text-sm text-slate-700">{creatives.rows.filter(x=>x.approval==="approved").length} approved creative(s) among {creatives.rows.length} loaded. Each campaign submission requires an approved, processed creative.</p>
   <Link href="/advertiser/creatives" className={secondary+" mt-4"}>Open creative library</Link>
  </Panel>
 </div>;
}
export function CampaignIndex(){
 const {business}=useAuth();
 const [filter,setFilter]=React.useState("");
 const path=business?"/campaigns?limit=30&businessId="+business.id+(filter?"&status="+filter:""):null;
 const list=useCollection<Campaign>(path);
 return <Panel title="My campaigns" action={<Link className={primary} href="/advertiser/create-campaign">Create draft</Link>}>
  <label className={label}>Filter by status<select value={filter} className={field+" max-w-sm"} onChange={e=>setFilter(e.target.value)}>
   {["","draft","submitted","changes_requested","approved","rejected","cancelled"].map(x=><option key={x} value={x}>{x?x.replaceAll("_"," "):"All statuses"}</option>)}
  </select></label>
  <CollectionNotice busy={list.busy} error={list.error} length={list.rows.length}/>
  <div className="mt-5 divide-y divide-slate-100">
   {list.rows.map(c=><Link key={c.id} href={"/advertiser/campaigns/"+c.id} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-blue-50/30">
    <div><p className="font-bold text-[#103459]">{c.title}</p><p className="mt-1 text-xs text-slate-500">{formatDate(c.startDate)} to {formatDate(c.endDate)} · Revision {c.revision}</p></div>
    <Badge value={c.status}/>
   </Link>)}
  </div><Pagination busy={list.busy} next={list.next} more={list.more} first={list.first}/>
 </Panel>;
}
function Weekdays({selected,onChange}:{selected:number[];onChange:(n:number[])=>void}){
 return <fieldset><legend className={label}>Delivery days</legend><div className="mt-2 flex flex-wrap gap-3">
  {days.map((day,index)=><label key={day} className="flex items-center gap-2 text-sm text-slate-700">
   <input type="checkbox" checked={selected.includes(index)} onChange={e=>onChange(e.target.checked?[...selected,index].sort():selected.filter(x=>x!==index))}/>{day}
  </label>)}
 </div></fieldset>;
}
const validDates=(start:string,end:string)=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||start>end)return false;
 const d=(Date.parse(end+"T00:00:00Z")-Date.parse(start+"T00:00:00Z"))/86400000;
 return Number.isFinite(d)&&d>=0&&d<60;
};
export function CampaignEditor(){
 const router=useRouter(),{business,session}=useAuth();
 const creatives=useCollection<Creative>(business?"/creatives?limit=100&businessId="+business.id:null);
 const [creativeId,setCreativeId]=React.useState("");
 const [title,setTitle]=React.useState("");
 const [start,setStart]=React.useState("");
 const [end,setEnd]=React.useState("");
 const [weekdays,setWeekdays]=React.useState<number[]>([0,1,2,3,4,5,6]);
 const [fromTime,setFromTime]=React.useState("09:00"),[toTime,setToTime]=React.useState("21:00");
 const [busy,setBusy]=React.useState(false),[error,setError]=React.useState("");

 async function submit(e:React.FormEvent){
  e.preventDefault();if(!business||busy)return;
  if(!validDates(start,end)||!weekdays.length||toTime<=fromTime){setError("Choose a valid 1–60 day schedule and a valid time window.");return;}
  setBusy(true);setError("");
  try{
   const created=await api<Campaign>("/campaigns",{method:"POST",
    csrfToken:session.csrfToken,idempotencyKey:newIdempotencyKey(),
    body:{businessId:business.id,creativeId,title:title.trim(),startDate:start,endDate:end,weekdays,
     timeWindow:{start:fromTime,end:toTime}}});
   router.push("/advertiser/campaigns/"+created.id);
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 return <Panel title="Create campaign draft">
  {!business?<Notice kind="warning">Register a business before creating campaigns.</Notice>:<>
   <Notice>Drafts are not submitted, booked or charged. Submit only after the selected creative has passed Admin review.</Notice>
   {creatives.error&&<Notice kind="error">{creatives.error}</Notice>}
   {!creatives.busy&&creatives.rows.length===0&&<Notice kind="warning">Upload and register a creative first in <Link href="/advertiser/creatives" className="font-bold underline">Creative Library</Link>.</Notice>}
   <form onSubmit={e=>void submit(e)} className="mt-5 grid max-w-3xl gap-4 sm:grid-cols-2">
    <label className={label+" sm:col-span-2"}>Title<input required maxLength={180} className={field} value={title} onChange={e=>setTitle(e.target.value)}/></label>
    <label className={label+" sm:col-span-2"}>Creative
     <select required className={field} value={creativeId} onChange={e=>setCreativeId(e.target.value)}>
      <option value="">Choose a registered creative</option>
      {creatives.rows.map(c=><option value={c.id} key={c.id}>{c.title} ({c.approval})</option>)}
     </select>
    </label>
    <label className={label}>Start date<input type="date" required className={field} value={start} onChange={e=>setStart(e.target.value)}/></label>
    <label className={label}>End date<input type="date" required className={field} value={end} onChange={e=>setEnd(e.target.value)}/></label>
    <label className={label}>Start time<input type="time" required className={field} value={fromTime} onChange={e=>setFromTime(e.target.value)}/></label>
    <label className={label}>End time<input type="time" required className={field} value={toTime} onChange={e=>setToTime(e.target.value)}/></label>
    <div className="sm:col-span-2"><Weekdays selected={weekdays} onChange={setWeekdays}/></div>
    {error&&<div className="sm:col-span-2"><Notice kind="error">{error}</Notice></div>}
    <div className="sm:col-span-2"><button className={primary} disabled={busy||!creatives.rows.length}>{busy?"Saving…":"Save campaign draft"}</button></div>
   </form>
  </>}
 </Panel>;
}
export function CampaignDetail({id}:{id:string}){
 const {session}=useAuth();const [row,setRow]=React.useState<Campaign|null>(null);
 const [title,setTitle]=React.useState("");const [loading,setLoading]=React.useState(true);
 const [error,setError]=React.useState("");const [notice,setNotice]=React.useState("");
 const [busy,setBusy]=React.useState(false);const [revision,setRevision]=React.useState(0);
 React.useEffect(()=>{
  let live=true;setLoading(true);setError("");setRow(null);
  void api<Campaign>("/campaigns/"+id).then(c=>{if(live){setRow(c);setTitle(c.title);}})
   .catch(e=>{if(live)setError(message(e));})
   .finally(()=>{if(live)setLoading(false);});
  return ()=>{live=false;};
 },[id,revision]);
 async function update(){
  if(!row||busy||!title.trim()||title.trim()===row.title)return;
  setBusy(true);setError("");setNotice("");
  try{await api("/campaigns/"+row.id,{method:"PATCH",csrfToken:session.csrfToken,
   body:{expectedRevision:row.revision,title:title.trim()}});
   setNotice("Draft saved.");setRevision(v=>v+1);
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 async function submit(){
  if(!row||busy)return;
  setBusy(true);setError("");setNotice("");
  try{await api("/campaigns/"+row.id+"/submit",{method:"POST",body:{},
    csrfToken:session.csrfToken,idempotencyKey:newIdempotencyKey()});
   setNotice("Campaign submitted for Admin review.");setRevision(v=>v+1);
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 return <Panel title="Campaign details" action={<Link className={secondary} href="/advertiser/campaigns">Back to campaigns</Link>}>
  {loading&&<p role="status">Loading campaign from backend…</p>}
  {error&&<Notice kind="error">{error}</Notice>}
  {notice&&<Notice kind="success">{notice}</Notice>}
  {row&&<div className="space-y-5">
   <div className="flex flex-wrap items-center gap-3"><Badge value={row.status}/><span className="text-xs text-slate-500">Revision {row.revision}</span></div>
   <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
    <p><strong>Dates:</strong> {row.startDate} to {row.endDate}</p><p><strong>Time:</strong> {row.timeWindow.start}–{row.timeWindow.end}</p>
    <p><strong>Weekdays:</strong> {row.weekdays.map(n=>days[n]).join(", ")}</p><p><strong>Creative:</strong> {row.creativeId}</p>
   </div>
   {row.reviewReason&&<Notice kind="warning">Review feedback: {row.reviewReason}</Notice>}
   {["draft","changes_requested"].includes(row.status)&&<div className="space-y-3">
    <label className={label}>Campaign title<input className={field} maxLength={180} value={title} onChange={e=>setTitle(e.target.value)}/></label>
    <div className="flex flex-wrap gap-3">
     <button className={secondary} type="button" disabled={busy||!title.trim()||title.trim()===row.title} onClick={()=>void update()}>Save title change</button>
     <button className={primary} type="button" disabled={busy||!row.creativeId||title!==row.title} onClick={()=>void submit()}>Submit for review</button>
    </div>
    <p className="text-xs text-slate-500">Submission requires an approved, processed creative and valid schedule. Changes-requested campaigns must first satisfy the backend revision rules.</p>
   </div>}
   <Notice>Booking and payment are separate, server-reviewed steps. This campaign record does not prove paid delivery.</Notice>
   <Link className={secondary} href="/advertiser/billing">View quotes and payments</Link>
  </div>}
 </Panel>;
}
type Asset={id:string;state:string;mimeType:string;failureCode:string|null};
type UploadIntent={assetId:string;uploadUrl:string;requiredHeaders:Record<string,string>;expiresAt:string};
const options=["bike_rear","auto_rear","auto_side","car_rear","car_interior","helmet"] as const;
export function CreativeLibrary(){
 const {business,session}=useAuth();
 const list=useCollection<Creative>(business?"/creatives?limit=100&businessId="+business.id:null);
 const [file,setFile]=React.useState<File|null>(null),[asset,setAsset]=React.useState<Asset|null>(null);
 const [name,setName]=React.useState(""),[placement,setPlacement]=React.useState<string>(options[0]);
 const [busy,setBusy]=React.useState(false),[error,setError]=React.useState(""),[notice,setNotice]=React.useState("");

 async function upload(){
  if(!business||!file||busy)return;
  setError("");setNotice("");setBusy(true);
  try{
   if(!["image/png","image/jpeg","video/mp4"].includes(file.type)||file.size<16||file.size>104857600)
    throw new Error("Use PNG, JPEG or MP4 files between 16 B and 100 MB.");
   const buffer=await file.arrayBuffer();
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",buffer)))
    .map(x=>x.toString(16).padStart(2,"0")).join("");
   const intent=await api<UploadIntent>("/creatives/upload-intents",{method:"POST",
    csrfToken:session.csrfToken,idempotencyKey:newIdempotencyKey(),
    body:{businessId:business.id,contentType:file.type,sizeBytes:file.size,sha256:hash}});
   const url=new URL(intent.uploadUrl);
   if(url.protocol!=="https:"||url.username||url.password||!url.hostname)
    throw new Error("Storage service returned an unsafe upload address.");
   const result=await fetch(intent.uploadUrl,{method:"PUT",headers:intent.requiredHeaders,
    body:buffer,redirect:"error",credentials:"omit"});
   if(!result.ok)throw new Error("Private media transfer failed ("+result.status+").");
   const completed=await api<Asset>("/creatives/assets/"+intent.assetId+"/complete",{method:"POST",
    csrfToken:session.csrfToken,body:{}});
   setAsset(completed);setNotice("Upload complete. Await scanning and media processing before registration.");
  }catch(e){setError(message(e));}
  finally{setBusy(false);}
 }
 async function checkAsset(){
  if(!asset||busy)return;setBusy(true);setError("");
  try{setAsset(await api<Asset>("/creatives/assets/"+asset.id));}
  catch(e){setError(message(e));}finally{setBusy(false);}
 }
 async function register(){
  if(!business||!asset||asset.state!=="ready"||!name.trim()||busy)return;
  setBusy(true);setError("");setNotice("");
  try{await api("/creatives",{method:"POST",csrfToken:session.csrfToken,
   idempotencyKey:newIdempotencyKey(),body:{businessId:business.id,title:name.trim(),placement,mediaAssetId:asset.id}});
   setAsset(null);setFile(null);setName("");setNotice("Creative registered for Admin review.");list.refresh();
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 return <div className="space-y-5">
  <Panel title="Upload and register creative">
   {!business?<Notice kind="warning">Create a business before uploading creatives.</Notice>:<>
    <Notice>Upload goes directly to private object storage using a short-lived signed URL. The backend verifies the upload and a separate worker must scan/process it before you can register a creative. Registration does not mean approval.</Notice>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
     <label className={label+" sm:col-span-2"}>Media file<input type="file" accept="image/png,image/jpeg,video/mp4" className={field} onChange={e=>{setFile(e.target.files?.[0]??null);setAsset(null);}}/></label>
     <label className={label}>Creative name<input required maxLength={180} value={name} className={field} onChange={e=>setName(e.target.value)}/></label>
     <label className={label}>Screen placement<select className={field} value={placement} onChange={e=>setPlacement(e.target.value)}>
      {options.map(x=><option key={x} value={x}>{x.replaceAll("_"," ")}</option>)}
     </select></label>
    </div>
    <div className="mt-4 flex flex-wrap gap-3">
     <button type="button" disabled={busy||!file||!!asset} className={primary} onClick={()=>void upload()}>{busy?"Processing…":"Upload to private storage"}</button>
     {asset&&<button type="button" className={secondary} disabled={busy} onClick={()=>void checkAsset()}>Check processing status</button>}
     {asset?.state==="ready"&&<button type="button" className={primary} disabled={busy||!name.trim()} onClick={()=>void register()}>Register for review</button>}
    </div>
    {asset&&<p className="mt-3 text-sm">Asset status: <Badge value={asset.state}/> {asset.failureCode&&("Failure: "+asset.failureCode)}</p>}
    {error&&<div className="mt-4"><Notice kind="error">{error}</Notice></div>}
    {notice&&<div className="mt-4"><Notice kind="success">{notice}</Notice></div>}
   </>}
  </Panel>
  <Panel title="Creative library" action={<button className={secondary} onClick={list.refresh}>Refresh</button>}>
   <CollectionNotice busy={list.busy} error={list.error} length={list.rows.length}/>
   <div className="divide-y divide-slate-100">
    {list.rows.map(c=><div key={c.id} className="flex flex-wrap justify-between gap-3 py-4">
     <div><p className="font-bold">{c.title}</p><p className="mt-1 text-xs text-slate-500">{c.placement.replaceAll("_"," ")} · {formatDate(c.createdAt)}</p>
      {c.reviewReason&&<p className="mt-2 text-xs text-amber-800">Review: {c.reviewReason}</p>}
     </div><Badge value={c.approval}/>
    </div>)}
   </div>
  </Panel>
 </div>;
}
