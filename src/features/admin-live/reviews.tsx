"use client";
// Exact-text checks in tests/b4-admin-live-contract.test.mjs: keep the decision endpoints and
// expectedRevision:detail.revision below as written.
import * as React from "react";
import {api,Card,Alert,Tag,Table,Confirm,FetchState,Pager,ActionResult,useRows,useAction,humanize,line,label,primary,secondary,date,explain} from "./common";
import type {Campaign,Creative,Application,AppDetail} from "./common";
const campaignChoices=["approved","rejected","changes_requested"] as const;
const creativeChoices=["approved","rejected"] as const;
const decisionLabel:Record<string,string>={approved:"Approve",rejected:"Reject",changes_requested:"Request changes",verified:"Verify"};
/** j/k move through the queue, Enter opens the highlighted row, Esc closes it. Ignored while typing or in a dialog. */
function useQueueKeys<T>(rows:T[],rowKey:(r:T)=>string,open:(r:T)=>void,close:()=>void){
 const [cursor,setCursor]=React.useState<string|null>(null);
 const index=Math.max(0,rows.findIndex(r=>rowKey(r)===cursor));
 const active=rows.length?rowKey(rows[index]):null;
 const latest=React.useRef({rows,index,open,close,rowKey});
 React.useEffect(()=>{latest.current={rows,index,open,close,rowKey};});
 React.useEffect(()=>{
  function onKey(e:KeyboardEvent){
   if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey)return;
   const t=e.target as HTMLElement|null;
   if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName)&&e.key==="Enter"||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
   if(document.querySelector('[role="dialog"],[role="alertdialog"]'))return;
   const {rows:r,index:i,open:o,close:c,rowKey:k}=latest.current;
   if(e.key==="j"||e.key==="k"){
    if(!r.length)return;e.preventDefault();
    const next=e.key==="j"?Math.min(r.length-1,i+1):Math.max(0,i-1);setCursor(k(r[next]));
   }else if(e.key==="Enter"&&r.length){e.preventDefault();o(r[i]);}
   else if(e.key==="Escape"){c();}
  }
  window.addEventListener("keydown",onKey);
  return ()=>window.removeEventListener("keydown",onKey);
 },[]);
 return {active,setCursor};
}
function KeyHint(){
 return <p className="hidden text-xs text-ink-muted sm:block">Keyboard: <kbd className="rounded border border-line px-1 font-mono">j</kbd> / <kbd className="rounded border border-line px-1 font-mono">k</kbd> move, <kbd className="rounded border border-line px-1 font-mono">Enter</kbd> opens, <kbd className="rounded border border-line px-1 font-mono">Esc</kbd> closes.</p>;
}
/** Decision and reason, then a confirmation dialog before anything is sent. */
function ActionEditor({decisions,minimum=10,subject,onSubmit,busy}:{decisions:readonly string[];minimum?:number;subject:string;
 onSubmit:(decision:string,reason:string)=>Promise<boolean|void>;busy:boolean}){
 const [decision,setDecision]=React.useState<string>(decisions[0]??"rejected");
 const [reason,setReason]=React.useState(""),[confirming,setConfirming]=React.useState(false);
 const id=React.useId();
 return <form className="space-y-3" onSubmit={e=>{e.preventDefault();if(reason.trim().length>=minimum)setConfirming(true);}}>
  <label className={label+" max-w-xs"}>Decision<select className={line} value={decision} onChange={e=>setDecision(e.target.value)}>
    {decisions.map(x=><option value={x} key={x}>{decisionLabel[x]??humanize(x)}</option>)}
  </select></label>
  <label className={label} htmlFor={id}>Recorded reason (at least {minimum} characters)</label>
  <textarea id={id} className={line+" !mt-1.5"} rows={3} minLength={minimum} maxLength={1000} required value={reason} onChange={e=>setReason(e.target.value)}/>
  <button type="submit" disabled={busy||reason.trim().length<minimum} className={primary}>Record reviewed decision</button>
  <Confirm open={confirming} onOpenChange={setConfirming} busy={busy} destructive={decision==="rejected"}
   title={(decisionLabel[decision]??humanize(decision))+" "+subject+"?"}
   description="The decision and reason are recorded in the audit log and the owner is notified."
   confirmLabel={(decisionLabel[decision]??humanize(decision))}
   onConfirm={()=>void onSubmit(decision,reason).then(()=>setConfirming(false))}>
   <blockquote className="rounded-md border-l-4 border-line-strong bg-paper p-3 text-sm text-ink">{reason.trim()}</blockquote>
  </Confirm>
 </form>;
}
type Submission={number:number;campaignRevision:number;createdAt:string};
const campaignStatuses:Array<[string,string]>=[["submitted","Submitted"],["changes_requested","Changes requested"],["approved","Approved"],["rejected","Rejected"],["draft","Draft"],["cancelled","Cancelled"],["","All campaigns"]];
export function CampaignReviews(){
 const [filter,setFilter]=React.useState("submitted");
 const list=useRows<Campaign>("/campaigns?limit=50"+(filter?"&status="+filter:""));
 const [selected,setSelected]=React.useState<Campaign|null>(null);
 const [detail,setDetail]=React.useState<Campaign|null>(null),[detailError,setDetailError]=React.useState("");
 const [history,setHistory]=React.useState<Submission[]>([]);
 const action=useAction();
 const open=(c:Campaign)=>{setSelected(c);setDetail(null);setHistory([]);setDetailError("");action.clear();};
 const keys=useQueueKeys(list.rows,c=>c.id,open,()=>setSelected(null));
 React.useEffect(()=>{
  if(!selected)return;
  const current=selected;let active=true;
  void Promise.all([api<Campaign>("/campaigns/"+current.id),api<Submission[]>("/campaigns/"+current.id+"/submissions")])
   .then(([c,h])=>{if(active){setDetail(c);setHistory(h);setDetailError("");}})
   .catch(e=>{if(active)setDetailError(explain(e));});
  return ()=>{active=false;};
 },[selected]);
 async function review(decision:string,reason:string){
  if(!detail||detail.status!=="submitted")return false;
  const done=await action.mutate("/admin/campaigns/"+detail.id+"/decision","POST",{
   decision,reason:reason.trim(),expectedRevision:detail.revision},"Campaign decision recorded.");
  if(done){setSelected(null);setDetail(null);list.refresh();}
  return done;
 }
 return <Card title="Campaign review queue" tools={<button type="button" className={secondary} onClick={list.refresh}>Refresh</button>}>
  <Alert>Only submitted campaigns can be reviewed. A campaign can only be approved once its creative has been independently checked and approved.</Alert>
  <div className="flex flex-wrap items-end justify-between gap-3">
   <label className={label+" w-full max-w-xs"}>Status<select className={line} value={filter} onChange={e=>{setFilter(e.target.value);setSelected(null);setDetail(null);}}>
    {campaignStatuses.map(([v,t])=><option key={v} value={v}>{t}</option>)}
   </select></label><KeyHint/>
  </div>
  <FetchState state={list} empty="No campaigns with this status."/>
  <ActionResult state={selected?{error:"",success:""}:action}/>
  <Table caption="Campaigns" rows={list.rows} rowKey={c=>c.id} activeKey={selected?.id??keys.active} onRowFocus={c=>keys.setCursor(c.id)} cols={[
   {key:"t",header:"Campaign",cell:c=><span className="font-medium">{c.title}</span>},
   {key:"d",header:"Dates",cell:c=><span className="whitespace-nowrap tabular-nums">{c.startDate} to {c.endDate}</span>},
   {key:"r",header:"Revision",numeric:true,cell:c=>c.revision},
   {key:"s",header:"Status",cell:c=><Tag value={c.status}/>},
   {key:"a",header:"",cell:c=><button className={secondary} onClick={()=>open(c)}>Inspect</button>},
  ]}/>
  <Pager state={list}/>
  {selected&&<section aria-label="Campaign under review" className="space-y-3 rounded-md border border-signal p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-heading font-semibold text-ink">{selected.title}</h3>
    <button type="button" className={secondary} onClick={()=>setSelected(null)}>Close</button></div>
   {detailError&&<Alert type="error">{detailError}</Alert>}
   {detail?<>
    <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
     <dt className="text-ink-muted">Dates</dt><dd className="tabular-nums">{detail.startDate} to {detail.endDate}</dd>
     <dt className="text-ink-muted">Submission</dt><dd className="tabular-nums">#{detail.submissionNumber}, revision {detail.revision} ({history.length} {history.length===1?"submission":"submissions"} so far)</dd>
     <dt className="text-ink-muted">Business ID</dt><dd className="font-mono text-xs break-all">{detail.ownerBusinessId}</dd>
     <dt className="text-ink-muted">Creative ID</dt><dd className="font-mono text-xs break-all">{detail.creativeId}</dd>
    </dl>
    {detail.reviewReason&&<Alert type="warning">Previous review: {detail.reviewReason}</Alert>}
    {detail.status==="submitted"?<ActionEditor key={detail.id} subject="this campaign" decisions={campaignChoices} busy={action.busy} onSubmit={review}/>:<Alert>This campaign isn&apos;t waiting for review, so no decision can be recorded.</Alert>}
   </>:!detailError&&<p role="status" className="text-sm text-ink-muted">Loading the current revision…</p>}
   <ActionResult state={action}/>
  </section>}
 </Card>;
}
export function CreativeReviews(){
 const list=useRows<Creative>("/creatives?limit=100");
 const [selected,setSelected]=React.useState<Creative|null>(null);
 const [previewError,setPreviewError]=React.useState("");
 const action=useAction();
 const open=(c:Creative)=>{if(c.approval==="pending"){setSelected(c);action.clear();}};
 const keys=useQueueKeys(list.rows,c=>c.id,open,()=>setSelected(null));
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
  if(!selected||selected.approval!=="pending")return false;
  const ok=await action.mutate("/admin/creatives/"+selected.id+"/decision","POST",{
   decision,reason:reason.trim()},"Creative decision recorded.");
  if(ok){setSelected(null);list.refresh();}
  return ok;
 }
 return <Card title="Creative moderation" tools={<button className={secondary} onClick={list.refresh}>Refresh</button>}>
  <Alert type="warning">Files aren&apos;t scanned automatically in test mode. A creative can only be approved after an independent scan and a processed version exist, so never approve one from its file name alone.</Alert>
  <KeyHint/>
  <FetchState state={list} empty="No creatives."/>
  {previewError&&<Alert type="error">{previewError}</Alert>}
  <ActionResult state={selected?{error:"",success:""}:action}/>
  <Table caption="Creatives" rows={list.rows} rowKey={x=>x.id} activeKey={selected?.id??keys.active} onRowFocus={x=>keys.setCursor(x.id)} cols={[
   {key:"t",header:"Creative",cell:x=><span className="font-medium">{x.title}</span>},
   {key:"p",header:"Placement",cell:x=>x.placement?humanize(x.placement):"—"},
   {key:"s",header:"Status",cell:x=><Tag value={x.approval}/>},
   {key:"a",header:"",cell:x=><div className="flex justify-end gap-2">
    <button className={secondary} onClick={()=>void preview(x.id)}>Preview</button>
    {x.approval==="pending"&&<button className={secondary} onClick={()=>open(x)}>Review</button>}
   </div>},
  ]}/>
  {selected&&<section aria-label="Creative under review" className="space-y-3 rounded-md border border-signal p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-heading font-semibold text-ink">{selected.title}</h3>
    <button type="button" className={secondary} onClick={()=>setSelected(null)}>Close</button></div>
   <p className="text-sm text-ink-muted">Media file ID <span className="font-mono text-xs break-all">{selected.mediaAssetId}</span></p>
   <ActionEditor key={selected.id} subject="this creative" decisions={creativeChoices} busy={action.busy} onSubmit={submit}/>
   <ActionResult state={action}/>
  </section>}
 </Card>;
}
type DocChoice={id:string;kind:string;decision:"verified"|"rejected"};
export function DriverReviews(){
 const list=useRows<Application>("/admin/driver-applications?limit=20");
 const [selected,setSelected]=React.useState<string|null>(null);
 const [detail,setDetail]=React.useState<AppDetail|null>(null),[error,setError]=React.useState("");
 const [doc,setDoc]=React.useState<DocChoice|null>(null),[docReason,setDocReason]=React.useState("");
 const action=useAction(),documentAction=useAction();
 const open=(a:Application)=>{setSelected(a.id);setDetail(null);setError("");action.clear();documentAction.clear();};
 const keys=useQueueKeys(list.rows,a=>a.id,open,()=>setSelected(null));
 React.useEffect(()=>{
  if(!selected)return;
  let active=true;
  void api<AppDetail>("/admin/driver-applications/"+selected).then(v=>{if(active){setDetail(v);setError("");}})
   .catch(e=>{if(active)setError(explain(e));});
  return ()=>{active=false;};
 },[selected]);
 async function review(decision:string,reason:string){
  if(!detail)return false;
  const ok=await action.mutate("/admin/driver-applications/"+detail.id+"/decision","POST",
    {decision,reason:reason.trim()},"Driver application decision recorded.");
  if(ok){setSelected(null);setDetail(null);list.refresh();}
  return ok;
 }
 async function documentDecision(){
  if(!detail||!doc||docReason.trim().length<8)return;
  const ok=await documentAction.mutate("/admin/driver-documents/"+doc.id+"/decision","POST",
    {decision:doc.decision,reason:docReason.trim()},"Document review recorded.");
  setDoc(null);
  if(ok){setDocReason("");setDetail(await api<AppDetail>("/admin/driver-applications/"+detail.id));}
 }
 return <Card title="Driver applications" tools={<button className={secondary} onClick={list.refresh}>Refresh</button>}>
  <Alert>An application can only be approved once each document is verified on its own and the driver has accepted the current partner agreement. Identity documents can&apos;t be checked for real in test mode.</Alert>
  <KeyHint/>
  <FetchState state={list} empty="No driver applications."/>
  <ActionResult state={selected?{error:"",success:""}:action}/>
  <Table caption="Driver applications" rows={list.rows} rowKey={a=>a.id} activeKey={selected??keys.active} onRowFocus={a=>keys.setCursor(a.id)} cols={[
   {key:"i",header:"Application",cell:a=><span className="font-mono text-xs break-all">{a.id}</span>},
   {key:"st",header:"Steps done",numeric:true,cell:a=>a.completedStep+" of 5"},
   {key:"d",header:"Submitted",cell:a=><span className="whitespace-nowrap tabular-nums">{date(a.submittedAt)}</span>},
   {key:"s",header:"Status",cell:a=><Tag value={a.state}/>},
   {key:"a",header:"",cell:a=><button className={secondary} onClick={()=>open(a)}>Inspect</button>},
  ]}/>
  <Pager state={list}/>
  {selected&&<section aria-label="Application under review" className="space-y-3 rounded-md border border-signal p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-heading font-semibold text-ink">Driver application</h3>
    <button type="button" className={secondary} onClick={()=>setSelected(null)}>Close</button></div>
   {error&&<Alert type="error">{error}</Alert>}
   {!detail&&!error&&<p role="status" className="text-sm text-ink-muted">Loading the application…</p>}
   {detail&&<>
    <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
     <dt className="text-ink-muted">Status</dt><dd><Tag value={detail.state}/></dd>
     <dt className="text-ink-muted">Driver ID</dt><dd className="font-mono text-xs break-all">{detail.driverUserId}</dd>
     <dt className="text-ink-muted">Vehicle ID</dt><dd className="font-mono text-xs break-all">{detail.vehicleId??"Not chosen yet"}</dd>
     <dt className="text-ink-muted">Agreement accepted</dt><dd>{detail.agreements.map(x=>x.templateVersion).join(", ")||"None"}</dd>
    </dl>
    <h4 className="font-heading text-sm font-semibold text-ink">Documents</h4>
    {detail.documents.length===0?<Alert type="warning">No documents uploaded.</Alert>:
    <Table caption="Submitted documents" rows={detail.documents} rowKey={d=>d.id} cols={[
     {key:"k",header:"Document",cell:d=>humanize(d.kind)},
     {key:"u",header:"Uploaded",cell:d=><span className="tabular-nums">{date(d.uploadedAt)}</span>},
     {key:"s",header:"Status",cell:d=><Tag value={d.status}/>},
     {key:"a",header:"",cell:d=>["scan_clean","scan_rejected"].includes(d.status)?<div className="flex justify-end gap-2">
      <button className={secondary} disabled={documentAction.busy} onClick={()=>{setDoc({id:d.id,kind:d.kind,decision:"verified"});setDocReason("");}}>Verify evidence</button>
      <button className={secondary} disabled={documentAction.busy} onClick={()=>{setDoc({id:d.id,kind:d.kind,decision:"rejected"});setDocReason("");}}>Reject document</button>
     </div>:null},
    ]}/>}
    <ActionResult state={documentAction}/>
    {["submitted","under_review"].includes(detail.state)?<ActionEditor key={detail.id} subject="this application" decisions={campaignChoices} busy={action.busy} onSubmit={review}/>:<Alert>This application isn&apos;t waiting for review, so no decision can be recorded.</Alert>}
    <ActionResult state={action}/>
   </>}
  </section>}
  <Confirm open={!!doc} onOpenChange={v=>{if(!v)setDoc(null);}} busy={documentAction.busy} destructive={doc?.decision==="rejected"}
   title={doc?(doc.decision==="verified"?"Verify ":"Reject ")+humanize(doc.kind).toLowerCase()+"?":""}
   description="Say what you checked. The reason is recorded in the audit log."
   confirmLabel={doc?.decision==="verified"?"Verify document":"Reject document"}
   onConfirm={()=>{if(docReason.trim().length>=8)void documentDecision();}}>
   <label className={label}>Review reason (at least 8 characters)
    <textarea className={line} rows={3} minLength={8} maxLength={1000} required value={docReason} onChange={e=>setDocReason(e.target.value)}/>
   </label>
  </Confirm>
 </Card>;
}
export function Approvals(){
 const [mode,setMode]=React.useState<"campaign"|"creative"|"driver">("campaign");
 return <div className="space-y-4">
  <div role="group" aria-label="Review queue" className="flex flex-wrap gap-2">{([["campaign","Campaigns"],["creative","Creatives"],["driver","Driver applications"]] as const).map(([k,v])=>
   <button aria-pressed={mode===k} className={mode===k?primary:secondary} onClick={()=>setMode(k)} key={k}>{v}</button>)}</div>
  {mode==="campaign"?<CampaignReviews/>:mode==="creative"?<CreativeReviews/>:<DriverReviews/>}
 </div>;
}
