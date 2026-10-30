"use client";
import * as React from "react";
import {api,downloadApiCsv} from "@/services/api-client";
import {Card,Alert,Tag,FetchState,Pager,ActionResult,useRows,useAction,line,label,primary,secondary,date,rupees,explain} from "./common";
import type {User,Reports,Ticket,Campaign} from "./common";
function useReport(){
 const [value,setValue]=React.useState<Reports|null>(null),[error,setError]=React.useState(""),[loading,setLoading]=React.useState(true),[version,setVersion]=React.useState(0);
 React.useEffect(()=>{
  let active=true;
  void api<Reports>("/admin/reports").then(x=>{if(active){setValue(x);setError("");}})
   .catch(e=>{if(active){setValue(null);setError(explain(e));}})
   .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[version]);
 return {value,error,loading,refresh:()=>{setLoading(true);setVersion(x=>x+1);}};
}
export function Overview(){
 const report=useReport();
 return <div className="space-y-5">
  <Alert>These are server-computed PostgreSQL metrics for the selected UTC reporting period. Payment figures are provider-confirmed records, not projected reach, profit or verified human impressions.</Alert>
  <Card title="Platform overview" tools={<button className={secondary} onClick={report.refresh}>Refresh report</button>}>
   {report.loading&&<p role="status">Loading verified dashboard metrics…</p>}
   {report.error&&<Alert type="error">{report.error}</Alert>}
   {report.value&&<><p className="mb-4 text-xs text-slate-600">{report.value.period.from} to {report.value.period.to} (UTC)</p>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
     {Object.entries(report.value.counts).map(([key,value])=><div key={key} className="rounded-xl border border-indigo-100 bg-[#f7f8ff] p-4">
      <p className="text-xs font-semibold capitalize text-slate-600">{key.replace(/([A-Z])/g," $1")}</p>
      <p className="mt-2 text-2xl font-extrabold text-[#1c2e59]">{value}</p>
     </div>)}
    </div></>}
  </Card>
  <Card title="Confirmed financial records">
   {report.value?<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(report.value.financial).map(([name,value])=>
    <div key={name} className="rounded-xl border border-slate-200 p-4">
     <p className="text-xs font-semibold text-slate-500">{name.replace(/([A-Z])/g," $1")}</p>
     <p className="mt-2 text-lg font-bold">{rupees(value)}</p>
    </div>)}</div>:<p className="text-sm text-slate-500">Financial totals unavailable without the backend.</p>}
  </Card>
 </div>;
}
export function Users({onlyRole}:{onlyRole?:string}){
 const [role,setRole]=React.useState(onlyRole??""),[status,setStatus]=React.useState("");
 const [search,setSearch]=React.useState(""),[term,setTerm]=React.useState("");
 const [selected,setSelected]=React.useState<User|null>(null),[reason,setReason]=React.useState("");
 const query="/admin/users?limit=30"+(role?"&role="+role:"")+(status?"&status="+status:"")+(term.length>=2?"&search="+encodeURIComponent(term):"");
 const data=useRows<User>(query),action=useAction();
 async function suspend(e:React.FormEvent){
  e.preventDefault();if(!selected||reason.trim().length<20)return;
  const change=selected.status==="active"?"SUSPENDED":"ACTIVE";
  const ok=await action.mutate("/admin/users/"+selected.id+"/status","PATCH",{
   expectedStatus:selected.status.toUpperCase(),status:change,reason:reason.trim()
  },"Account status updated. All sessions for this account were revoked.");
  if(ok){setSelected(null);setReason("");data.refresh();}
 }
 return <Card title={onlyRole==="ADVERTISER"?"Advertiser accounts":"Users and access"} tools={<button className={secondary} onClick={data.refresh}>Refresh</button>}>
  <Alert>Only verified server roles are trusted. Account status changes require an explicit reason and invalidate all active sessions. Admin users cannot be suspended here.</Alert>
  <div className="mt-4 grid gap-3 sm:grid-cols-3">
   {!onlyRole&&<label className={label}>Role<select className={line} value={role} onChange={e=>{setRole(e.target.value);setSelected(null);}}>
    <option value="">All roles</option>{["ADVERTISER","DRIVER","ADMIN"].map(x=><option key={x} value={x}>{x}</option>)}
   </select></label>}
   <label className={label}>Status<select className={line} value={status} onChange={e=>{setStatus(e.target.value);setSelected(null);}}>
    <option value="">All statuses</option>{["PENDING","ACTIVE","SUSPENDED","CLOSED"].map(x=><option key={x} value={x}>{x}</option>)}
   </select></label>
   <form className="sm:col-span-2" onSubmit={e=>{e.preventDefault();setTerm(search.trim().length>=2?search.trim():"");setSelected(null);}}>
    <label className={label}>Search name or email<input className={line} minLength={2} maxLength={80} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Minimum two characters"/></label>
    <button type="submit" className={secondary+" mt-2"}>Search</button>
   </form>
  </div>
  <FetchState state={data}/>
  <div className="mt-4 divide-y divide-slate-100">{data.rows.map(x=><div key={x.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
   <div><p className="font-semibold">{x.displayName}</p><p className="text-slate-600">{x.email}</p>
    <p className="mt-1 text-xs text-slate-400">Joined {date(x.createdAt)} · {x.verified?"Verified email":"Unverified"}</p></div>
   <div className="flex items-center gap-2"><Tag value={x.role}/><Tag value={x.status}/>
    {x.role!=="admin"&&["active","suspended"].includes(x.status)&&<button className={secondary} onClick={()=>{setSelected(x);setReason("");action.clear();}}>Manage</button>}
   </div>
  </div>)}</div>
  <Pager state={data}/>
  {selected&&<form onSubmit={e=>void suspend(e)} className="mt-4 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
   <h3 className="font-bold">{selected.status==="active"?"Suspend":"Reactivate"} {selected.displayName}</h3>
   <label className={label}>Audit reason (minimum 20 characters)
    <textarea rows={3} className={line} minLength={20} maxLength={500} required value={reason} onChange={e=>setReason(e.target.value)}/>
   </label>
   <button type="submit" className={primary} disabled={action.busy||reason.trim().length<20}>Confirm account change</button>
   <button type="button" className={secondary+" ml-2"} onClick={()=>setSelected(null)}>Cancel</button>
   <ActionResult state={action}/>
  </form>}
 </Card>;
}
export function Support(){
 const list=useRows<Ticket>("/support/tickets?limit=50");
 const [selected,setSelected]=React.useState<Ticket|null>(null);
 const [detail,setDetail]=React.useState<(Ticket&{messages:Array<{id:string;body:string;visibility:string;createdAt:string}>})|null>(null);
 const [error,setError]=React.useState(""),[reply,setReply]=React.useState(""),[visibility,setVisibility]=React.useState("PUBLIC");
 const [nextStatus,setNextStatus]=React.useState("IN_PROGRESS");
 const statusAction=useAction(),messageAction=useAction();
 React.useEffect(()=>{
  if(!selected)return;
  let active=true;
  void api<Ticket&{messages:Array<{id:string;body:string;visibility:string;createdAt:string}>}>("/support/tickets/"+selected.id)
  .then(v=>{if(active){setDetail(v);setError("");}})
  .catch(e=>{if(active)setError(explain(e));});
  return ()=>{active=false;};
 },[selected]);
 const permitted=(status:string)=>status==="open"?"IN_PROGRESS":status==="in_progress"?"RESOLVED":status==="resolved"?"CLOSED":null;
 async function advance(){
  if(!detail)return;
  const next=permitted(detail.status);
  if(!next||nextStatus!==next)return;
  const ok=await statusAction.mutate("/admin/support/tickets/"+detail.id,"PATCH",{
   expectedVersion:detail.version,status:next
  },"Support ticket state updated and audited.");
  if(ok){setSelected(null);setDetail(null);list.refresh();}
 }
 async function message(e:React.FormEvent){
  e.preventDefault();if(!detail||!reply.trim())return;
  const ok=await messageAction.mutate("/support/tickets/"+detail.id+"/messages","POST",{
   body:reply.trim(),visibility
  },"Support message saved.");
  if(ok){setReply("");setDetail(await api<typeof detail>("/support/tickets/"+detail.id));}
 }
 return <Card title="Support and disputes" tools={<button className={secondary} onClick={list.refresh}>Refresh</button>}>
  <FetchState state={list}/>
  <div className="mt-4 divide-y divide-slate-100">{list.rows.map(t=><div key={t.id} className="flex flex-wrap justify-between gap-3 py-3">
   <div><p className="font-semibold">{t.subject}</p><p className="text-xs text-slate-500">{t.category} · {date(t.createdAt)}</p></div>
   <div className="flex items-center gap-2"><Tag value={t.status}/><button className={secondary} onClick={()=>{setSelected(t);setDetail(null);setError("");}}>Open</button></div>
  </div>)}</div><Pager state={list}/>
  {selected&&<div className="mt-5 space-y-4 rounded-xl border border-indigo-200 p-4">
   {error&&<Alert type="error">{error}</Alert>}
   {!detail&&<p role="status">Loading ticket…</p>}
   {detail&&<>
    <h3 className="font-bold">{detail.subject}</h3><p className="text-sm text-slate-700">{detail.description}</p>
    <div className="space-y-2">{detail.messages.map(m=><div key={m.id} className="rounded-lg bg-slate-50 p-3 text-sm">
     <Tag value={m.visibility}/> <span className="ml-2">{m.body}</span><p className="mt-1 text-xs text-slate-400">{date(m.createdAt)}</p>
    </div>)}</div>
    {permitted(detail.status)&&<div className="space-y-2">
     <p className="text-sm">Allowed next state: <strong>{permitted(detail.status)}</strong></p>
     <button type="button" className={primary} disabled={statusAction.busy} onClick={()=>void advance()}>Advance ticket status</button>
     <ActionResult state={statusAction}/>
    </div>}
    {detail.status!=="closed"&&<form className="space-y-3" onSubmit={e=>void message(e)}>
     <label className={label}>Reply<textarea className={line} rows={3} required maxLength={2000} value={reply} onChange={e=>setReply(e.target.value)}/></label>
     <label className={label}>Visibility<select className={line} value={visibility} onChange={e=>setVisibility(e.target.value)}>
      <option value="PUBLIC">Visible to ticket owner</option><option value="INTERNAL">Internal admin note</option>
     </select></label>
     <button className={primary} disabled={messageAction.busy||!reply.trim()}>Save reply</button>
     <ActionResult state={messageAction}/>
    </form>}
   </>}
  </div>}
 </Card>;
}
export function Analytics(){
 const report=useReport(),[error,setError]=React.useState("");
 async function download(path:string,name:string){
  setError("");try{await downloadApiCsv(path,name);}catch(e){setError(explain(e));}
 }
 return <div className="space-y-5">
  <Overview/>
  <Card title="Official backend CSV exports">
   <Alert>Reports reflect recorded backend state. Missing provider verification remains missing data, not simulated revenue.</Alert>
   <div className="mt-4 flex flex-wrap gap-3">
    <button className={secondary} onClick={()=>void download("/admin/reports/export","advibe-admin-report.csv")}>Download current report</button>
    <button className={secondary} onClick={()=>void download("/admin/audit-events/export","advibe-admin-audit.csv")}>Download audit events</button>
   </div>{error&&<Alert type="error">{error}</Alert>}
  </Card>
 </div>;
}
export function Audit(){
 const rows=useRows<{id:string;actorUserId:string|null;action:string;resourceType:string;resourceId:string;createdAt:string}>("/admin/audit-events?limit=30");
 const [error,setError]=React.useState("");
 async function exportCsv(){setError("");try{await downloadApiCsv("/admin/audit-events/export","advibe-audit.csv");}catch(e){setError(explain(e));}}
 return <Card title="Server audit events" tools={<div className="flex gap-2">
  <button className={secondary} onClick={rows.refresh}>Refresh</button><button className={secondary} onClick={()=>void exportCsv()}>Export CSV</button>
 </div>}>
  <Alert>Audit entries are persisted on the backend and exclude secret request bodies. The list is paginated and scope-limited.</Alert>
  {error&&<Alert type="error">{error}</Alert>}
  <FetchState state={rows}/>
  <div className="mt-4 divide-y divide-slate-100">{rows.rows.map(x=><div className="py-3 text-sm" key={x.id}>
   <p className="font-semibold">{x.action}</p><p className="mt-1 break-all text-xs text-slate-500">{x.resourceType} · {x.resourceId} · {date(x.createdAt)}</p>
  </div>)}</div><Pager state={rows}/>
 </Card>;
}
export function Payments(){
 const attempts=useRows<{id:string;orderId:string;amountPaise:number;status?:string;state?:string}>("/payments?limit=50");
 const [issues,setIssues]=React.useState<unknown[]>([]),[error,setError]=React.useState("");
 React.useEffect(()=>{
  let active=true;
  void api<unknown[]>("/admin/finance/reconciliation").then(v=>{if(active)setIssues(v);}).catch(e=>{if(active)setError(explain(e));});
  return ()=>{active=false;};
 },[]);
 return <div className="space-y-5">
  <Alert type="warning">Cashfree and refunds are simulated or disabled in development mode. No payment is marked successful here without verified provider evidence. Actual checkout and settlement integrations are planned for Part 6.</Alert>
  <Card title="Payment attempts"><FetchState state={attempts}/>
   <div className="divide-y divide-slate-100">{attempts.rows.map(x=><div className="flex justify-between gap-3 py-3 text-sm" key={x.id}>
    <div><p className="font-semibold">{rupees(x.amountPaise)}</p><p className="text-xs text-slate-500">{x.orderId}</p></div><Tag value={x.status??x.state}/>
   </div>)}</div><Pager state={attempts}/>
  </Card>
  <Card title="Finance reconciliation exceptions">
   {error&&<Alert type="error">{error}</Alert>}
   <p className="text-sm text-slate-700">Returned reconciliation records: {issues.length}</p>
   <Alert>Reconciliation and refund actions are withheld until real provider verification and finance approvals are available.</Alert>
  </Card>
 </div>;
}
export function Bookings(){
 const approved=useRows<Campaign>("/campaigns?limit=50&status=approved");
 const [selected,setSelected]=React.useState("");
 const [bookings,setBookings]=React.useState<unknown[]>([]),[error,setError]=React.useState("");
 React.useEffect(()=>{
  if(!selected)return;let active=true;
  void api<unknown[]>("/campaigns/"+selected+"/bookings").then(v=>{if(active){setBookings(v);setError("");}})
    .catch(e=>{if(active){setBookings([]);setError(explain(e));}});
  return ()=>{active=false;};
 },[selected]);
 return <Card title="Booking and delivery schedule">
  <Alert>Only confirmed backend bookings appear. An approved campaign is not a paid reservation. Mock checkout never confirms real bookings.</Alert>
  <FetchState state={approved}/>
  <label className={label+" mt-4 max-w-lg"}>Approved campaign<select value={selected} className={line} onChange={e=>setSelected(e.target.value)}>
   <option value="">Select a campaign</option>{approved.rows.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}
  </select></label>
  {error&&<Alert type="error">{error}</Alert>}
  {selected&&<p className="mt-4 text-sm">Recorded bookings: {bookings.length}</p>}
  <Pager state={approved}/>
 </Card>;
}
export function Settlements(){
 return <Card title="Driver settlements and payouts">
  <Alert type="warning">Payout initiation and bank verification are disabled while external services are mocked. No bank payout can be claimed or approved using simulated provider evidence.</Alert>
  <p className="mt-4 text-sm text-slate-600">Settlement creation, independent provider reconciliation and payment release remain controlled by the Part 6 finance and approval gates.</p>
 </Card>;
}
export function Notifications(){
 const {session}=useAdmin();
 const rows=useRows<{id:string;title:string;body:string;kind:string;readAt:string|null;createdAt:string}>("/notifications?limit=50");
 const action=useAction();
 async function mark(id:string){
  const ok=await action.mutate("/notifications/"+id+"/read","POST",{},"Notification marked read");
  if(ok)rows.refresh();
 }
 return <Card title="Admin notifications" tools={<button className={secondary} onClick={rows.refresh}>Refresh</button>}>
  <FetchState state={rows}/>
  <ActionResult state={action}/>
  <div className="divide-y divide-slate-100">{rows.rows.map(n=><div key={n.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
   <div><p className="font-bold">{n.title}</p><p className="text-slate-600">{n.body}</p><p className="mt-1 text-xs text-slate-400">{date(n.createdAt)}</p></div>
   {n.readAt?<Tag value="read"/>:<button className={secondary} disabled={action.busy} onClick={()=>void mark(n.id)}>Mark read</button>}
  </div>)}</div><Pager state={rows}/>
 </Card>;
}
export function Settings(){
 const [status,setStatus]=React.useState<{mode:string;externalProviders:string}|null>(null),[error,setError]=React.useState("");
 React.useEffect(()=>{let active=true;
  void api<{mode:string;externalProviders:string}>("/integrations/status")
   .then(v=>{if(active)setStatus(v);}).catch(e=>{if(active)setError(explain(e));});
  return ()=>{active=false;};
 },[]);
 return <Card title="Platform security and integrations">
  <Alert>Admin sessions require server-enforced MFA. Roles, account state, CSRF and audit actions are validated by the backend, not browser settings.</Alert>
  {error&&<Alert type="error">{error}</Alert>}
  <div className="mt-4 space-y-3 text-sm">
   <p>External provider mode: <Tag value={status?.mode??"unavailable"}/></p>
   <p>External status: {status?.externalProviders??"Backend connection required"}</p>
   <p>Live payment, private KYC processing, hardware playback and payouts require separate signed-off infrastructure and provider integration.</p>
  </div>
 </Card>;
}
