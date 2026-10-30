"use client";
import * as React from "react";
import {api,Card,Alert,Tag,FetchState,Pager,ActionResult,useRows,useAction,line,label,primary,secondary,date,explain} from "./common";
import type {Campaign,Creative,Application,AppDetail} from "./common";
const campaignChoices=["approved","rejected","changes_requested"] as const;
const creativeChoices=["approved","rejected"] as const;
function ActionEditor({decisions,minimum=10,onSubmit,busy}:{decisions:readonly string[];minimum?:number;
 onSubmit:(decision:string,reason:string)=>Promise<void>;busy:boolean}){
 const [decision,setDecision]=React.useState(decisions[0]??"rejected");
 const [reason,setReason]=React.useState("");
 return <form className="mt-4 space-y-3" onSubmit={e=>{e.preventDefault();void onSubmit(decision,reason);}}>
  <label className={label}>Decision<select className={line} value={decision} onChange={e=>setDecision(e.target.value)}>
    {decisions.map(x=><option value={x} key={x}>{x.replaceAll("_"," ")}</option>)}
  </select></label>
  <label className={label}>Recorded reason (at least {minimum} characters)
   <textarea className={line} rows={3} minLength={minimum} maxLength={1000} required value={reason} onChange={e=>setReason(e.target.value)}/>
  </label>
  <button type="submit" disabled={busy||reason.trim().length<minimum} className={primary}>
   {busy?"Submitting…":"Record reviewed decision"}
  </button>
 </form>;
}
export function CampaignReviews(){
 const [filter,setFilter]=React.useState("submitted");
 const list=useRows<Campaign>("/campaigns?limit=50"+(filter?"&status="+filter:""));
 const [selected,setSelected]=React.useState<Campaign|null>(null);
 const [detail,setDetail]=React.useState<Campaign|null>(null),[detailError,setDetailError]=React.useState("");
 const [history,setHistory]=React.useState<Array<{number:number;campaignRevision:number;createdAt:string}>>([]);
 const action=useAction();
 React.useEffect(()=>{
  if(!selected)return;
  const current=selected;let active=true;
  void Promise.all([api<Campaign>("/campaigns/"+current.id),api<Array<{number:number;campaignRevision:number;createdAt:string}>>("/campaigns/"+current.id+"/submissions")])
   .then(([c,h])=>{if(active){setDetail(c);setHistory(h);setDetailError("");}})
   .catch(e=>{if(active)setDetailError(explain(e));});
  return ()=>{active=false;};
 },[selected]);
 async function review(decision:string,reason:string){
  if(!detail||detail.status!=="submitted")return;
  const done=await action.mutate("/admin/campaigns/"+detail.id+"/decision","POST",{
   decision,reason:reason.trim(),expectedRevision:detail.revision},"Campaign decision recorded and audited.");
  if(done){setSelected(null);setDetail(null);list.refresh();}
 }
 return <Card title="Campaign review queue" tools={<button type="button" className={secondary} onClick={list.refresh}>Refresh</button>}>
  <Alert>Only backend-submitted campaigns can be reviewed. Approval requires an independently processed and approved creative.</Alert>
  <label className={label+" mt-4 max-w-xs"}>Status<select className={line} value={filter} onChange={e=>{setFilter(e.target.value);setSelected(null);setDetail(null);}}>
   {["submitted","changes_requested","approved","rejected","draft","cancelled",""].map(x=><option key={x} value={x}>{x||"All campaigns"}</option>)}
  </select></label>
  <FetchState state={list}/>
  <div className="mt-4 divide-y divide-slate-100">
   {list.rows.map(c=><div className="flex flex-wrap items-center justify-between gap-3 py-3" key={c.id}>
    <div><p className="font-semibold text-[#162e5b]">{c.title}</p>
     <p className="text-xs text-slate-500">{c.startDate}–{c.endDate} · revision {c.revision}</p></div>
    <div className="flex items-center gap-3"><Tag value={c.status}/><button className={secondary} onClick={()=>{setSelected(c);setDetail(null);setHistory([]);setDetailError("");action.clear();}}>Inspect</button></div>
   </div>)}
  </div><Pager state={list}/>
  {selected&&<div className="mt-5 space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/30 p-4">
   <h3 className="font-bold">Review: {selected.title}</h3>
   {detailError&&<Alert type="error">{detailError}</Alert>}
   {detail?<><p className="text-sm">Business: {detail.ownerBusinessId} · Creative: {detail.creativeId} · Submission #{detail.submissionNumber}</p>
    <p className="text-sm">Schedule: {detail.startDate} to {detail.endDate}</p>
    <p className="text-xs text-slate-600">Submission snapshots: {history.length}. Review current revision only.</p>
    {detail.reviewReason&&<Alert type="warning">{detail.reviewReason}</Alert>}
    {detail.status==="submitted"?<ActionEditor decisions={campaignChoices} busy={action.busy} onSubmit={review}/>:<Alert>Not currently submitted; action unavailable.</Alert>}
   </>:<p role="status" className="text-sm text-slate-500">Retrieving current revision…</p>}
   <ActionResult state={action}/>
  </div>}
 </Card>;
}
export function CreativeReviews(){
 const list=useRows<Creative>("/creatives?limit=100");
 const [selected,setSelected]=React.useState<Creative|null>(null);
 const [previewError,setPreviewError]=React.useState("");
 const action=useAction();
 async function preview(id:string){
  setPreviewError("");
  try{
   const link=await api<{url:string;expiresInSeconds:number}>("/admin/creatives/"+id+"/preview-url");
   const parsed=new URL(link.url);
   if(parsed.protocol!=="https:"||parsed.username||parsed.password)throw new Error("Unsafe media URL");
   window.open(parsed.href,"_blank","noopener,noreferrer");
  }catch(e){setPreviewError(explain(e));}
 }
 async function submit(decision:string,reason:string){
  if(!selected||selected.approval!=="pending")return;
  const ok=await action.mutate("/admin/creatives/"+selected.id+"/decision","POST",{
   decision,reason:reason.trim()},"Creative decision recorded with backend verification.");
  if(ok){setSelected(null);list.refresh();}
 }
 return <Card title="Creative moderation" tools={<button className={secondary} onClick={list.refresh}>Refresh</button>}>
  <Alert type="warning">The mock storage adapter does not verify media. The backend refuses approvals until an independent scan and processed version exist. Never approve a file solely from its filename.</Alert>
  <FetchState state={list}/>
  <div className="mt-4 divide-y divide-slate-100">{list.rows.map(x=><div key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
   <div><p className="font-semibold">{x.title}</p><p className="text-xs text-slate-500">{x.placement} · {x.ownerBusinessId}</p></div>
   <div className="flex items-center gap-2"><Tag value={x.approval}/>
    <button className={secondary} onClick={()=>void preview(x.id)}>Preview</button>
    {x.approval==="pending"&&<button className={secondary} onClick={()=>{setSelected(x);action.clear();}}>Review</button>}
   </div>
  </div>)}</div>
  {previewError&&<Alert type="error">{previewError}</Alert>}
  {selected&&<div className="mt-5 rounded-xl border border-slate-200 p-4">
   <h3 className="font-bold">{selected.title}</h3>
   <p className="mt-1 text-xs text-slate-500">Media asset {selected.mediaAssetId}</p>
   <ActionEditor decisions={creativeChoices} busy={action.busy} onSubmit={submit}/>
   <ActionResult state={action}/>
  </div>}
 </Card>;
}
export function DriverReviews(){
 const list=useRows<Application>("/admin/driver-applications?limit=20");
 const [selected,setSelected]=React.useState<string|null>(null);
 const [detail,setDetail]=React.useState<AppDetail|null>(null),[error,setError]=React.useState("");
 const action=useAction(),documentAction=useAction();
 React.useEffect(()=>{
  if(!selected)return;
  let active=true;
  void api<AppDetail>("/admin/driver-applications/"+selected).then(v=>{if(active){setDetail(v);setError("");}})
   .catch(e=>{if(active)setError(explain(e));});
  return ()=>{active=false;};
 },[selected]);
 async function review(decision:string,reason:string){
  if(!detail)return;
  const ok=await action.mutate("/admin/driver-applications/"+detail.id+"/decision","POST",
    {decision,reason:reason.trim()},"Driver application decision recorded.");
  if(ok){setSelected(null);setDetail(null);list.refresh();}
 }
 async function documentDecision(id:string,decision:"verified"|"rejected"){
  if(!detail)return;
  const reason=window.prompt("Give an evidence-based review reason (at least 8 characters):");
  if(!reason||reason.trim().length<8)return;
  const ok=await documentAction.mutate("/admin/driver-documents/"+id+"/decision","POST",
    {decision,reason:reason.trim()},"Document review recorded.");
  if(ok){setDetail(await api<AppDetail>("/admin/driver-applications/"+detail.id));}
 }
 return <Card title="Driver applications" tools={<button className={secondary} onClick={list.refresh}>Refresh</button>}>
  <Alert>Application approval requires individually verified documents and an accepted current agreement. In mock storage mode, real KYC verification remains unavailable.</Alert>
  <FetchState state={list}/>
  <div className="mt-4 divide-y divide-slate-100">{list.rows.map(v=><div key={v.id} className="flex items-center justify-between gap-3 py-3">
   <div><p className="break-all text-sm font-semibold">{v.id}</p><p className="text-xs text-slate-500">Submitted {date(v.submittedAt)}</p></div>
   <div className="flex items-center gap-2"><Tag value={v.state}/><button className={secondary} onClick={()=>{setSelected(v.id);setDetail(null);setError("");action.clear();}}>Inspect</button></div>
  </div>)}</div><Pager state={list}/>
  {selected&&<div className="mt-5 space-y-3 rounded-xl border border-indigo-200 p-4">
   {error&&<Alert type="error">{error}</Alert>}
   {!detail&&<p role="status">Loading application evidence…</p>}
   {detail&&<><h3 className="font-bold">Application: {detail.id}</h3>
    <p className="text-sm">Driver {detail.driverUserId} · Vehicle {detail.vehicleId??"Not assigned"} · State <Tag value={detail.state}/></p>
    <p className="text-sm">Accepted agreement versions: {detail.agreements.map(x=>x.templateVersion).join(", ")||"None"}</p>
    <h4 className="font-semibold">Submitted documents</h4>
    {detail.documents.length===0&&<Alert type="warning">No documents uploaded.</Alert>}
    {detail.documents.map(doc=><div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-2 text-sm">
     <span>{doc.kind} · <Tag value={doc.status}/></span>
     {["scan_clean","scan_rejected"].includes(doc.status)&&<div className="flex gap-2">
      <button className={secondary} disabled={documentAction.busy} onClick={()=>void documentDecision(doc.id,"verified")}>Verify evidence</button>
      <button className={secondary} disabled={documentAction.busy} onClick={()=>void documentDecision(doc.id,"rejected")}>Reject document</button>
     </div>}
    </div>)}
    <ActionResult state={documentAction}/>
    {["submitted","under_review"].includes(detail.state)?<ActionEditor decisions={campaignChoices} busy={action.busy} onSubmit={review}/>:<Alert>Application review unavailable in this state.</Alert>}
    <ActionResult state={action}/>
   </>}
  </div>}
 </Card>;
}
export function Approvals(){
 const [mode,setMode]=React.useState<"campaign"|"creative"|"driver">("campaign");
 return <div className="space-y-5">
  <div className="flex flex-wrap gap-2">{([["campaign","Campaigns"],["creative","Creatives"],["driver","Driver KYC"]] as const).map(([k,v])=>
   <button className={mode===k?primary:secondary} onClick={()=>setMode(k)} key={k}>{v}</button>)}</div>
  {mode==="campaign"?<CampaignReviews/>:mode==="creative"?<CreativeReviews/>:<DriverReviews/>}
 </div>;
}
