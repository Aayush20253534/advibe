"use client";
// Exact-text checks in tests/b4-admin-live-contract.test.mjs: keep the request bodies below
// (expectedStatus:selected.status.toUpperCase(), expectedVersion:detail.version) compact.
import * as React from "react";
import {api,downloadApiCsv} from "@/services/api-client";
import {Dialog,Metric} from "@/components/ui";
import {Card,Alert,Tag,Table,FetchState,Pager,ActionResult,Confirm,useRows,useAction,humanize,line,label,primary,secondary,date,rupees,explain} from "./common";
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
const financeLabels:Record<string,string>={
 confirmedBookingGrossPaise:"Confirmed bookings (gross)",confirmedRefundsPaise:"Confirmed refunds",
 periodDifferencePaise:"Net for the period",paidUnallocatedGrossPaise:"Paid, not yet allocated (gross)",
 reviewedDriverEarningsPaise:"Reviewed driver earnings",confirmedDriverPayoutsPaise:"Confirmed driver payouts",
};
export function Overview(){
 const report=useReport();
 const finance=report.value?Object.entries(report.value.financial):[];
 return <div className="space-y-4">
  <Card title="Platform activity" tools={<button className={secondary} onClick={report.refresh}>Refresh</button>}>
   {report.loading&&<p role="status" className="text-sm text-ink-muted">Loading…</p>}
   {report.error&&<Alert type="error">{report.error}</Alert>}
   {report.value&&<><p className="text-sm text-ink-muted tabular-nums">{report.value.period.from} to {report.value.period.to} ({report.value.period.timezone})</p>
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
     {Object.entries(report.value.counts).map(([key,value])=><Metric key={key} label={humanize(key)} value={value} className="p-3"/>)}
    </div></>}
  </Card>
  <Card title="Confirmed money">
   {report.value?<Table caption="Confirmed money for the period" rows={finance} rowKey={r=>r[0]} cols={[
    {key:"m",header:"Measure",cell:r=>financeLabels[r[0]]??humanize(r[0])},
    {key:"a",header:"Amount",numeric:true,cell:r=>rupees(r[1])},
   ]}/>:<p className="text-sm text-ink-muted">Totals are unavailable until the report loads.</p>}
   <p className="text-sm text-ink-muted">Counts and amounts come from recorded payments and reviews for the period. They are not projected reach, profit or verified impressions.</p>
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
  },"Account status updated. All sessions for this account were signed out.");
  if(ok){setSelected(null);setReason("");data.refresh();}
 }
 return <Card title={onlyRole==="ADVERTISER"?"Advertiser accounts":"Accounts"} tools={<button className={secondary} onClick={data.refresh}>Refresh</button>}>
  <div className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,12rem))_minmax(0,1fr)]">
   {!onlyRole&&<label className={label}>Role<select className={line} value={role} onChange={e=>{setRole(e.target.value);setSelected(null);}}>
    <option value="">All roles</option>{[["ADVERTISER","Advertiser"],["DRIVER","Driver"],["ADMIN","Admin"]].map(([v,t])=><option key={v} value={v}>{t}</option>)}
   </select></label>}
   <label className={label}>Status<select className={line} value={status} onChange={e=>{setStatus(e.target.value);setSelected(null);}}>
    <option value="">All statuses</option>{[["PENDING","Pending"],["ACTIVE","Active"],["SUSPENDED","Suspended"],["CLOSED","Closed"]].map(([v,t])=><option key={v} value={v}>{t}</option>)}
   </select></label>
   <form className="flex items-end gap-2" onSubmit={e=>{e.preventDefault();setTerm(search.trim().length>=2?search.trim():"");setSelected(null);}}>
    <label className={label+" flex-1"}>Search name or email<input className={line} type="search" minLength={2} maxLength={80} value={search} onChange={e=>setSearch(e.target.value)} placeholder="At least 2 characters"/></label>
    <button type="submit" className={secondary}>Search</button>
   </form>
  </div>
  <FetchState state={data} empty="No accounts match these filters."/>
  <ActionResult state={action}/>
  <Table caption="Accounts" rows={data.rows} rowKey={x=>x.id} cols={[
   {key:"n",header:"Name",cell:x=><><span className="font-medium">{x.displayName}</span><span className="block text-ink-muted">{x.email}</span></>},
   {key:"r",header:"Role",cell:x=><Tag value={x.role}/>},
   {key:"s",header:"Status",cell:x=><Tag value={x.status}/>},
   {key:"v",header:"Email",cell:x=>x.verified?"Verified":"Not verified"},
   {key:"j",header:"Joined",cell:x=><span className="tabular-nums">{date(x.createdAt)}</span>},
   {key:"a",header:"",cell:x=>x.role!=="admin"&&["active","suspended"].includes(x.status)?<button className={secondary} onClick={()=>{setSelected(x);setReason("");action.clear();}}>Manage</button>:null},
  ]}/>
  <Pager state={data}/>
  <p className="text-sm text-ink-muted">Changing an account&apos;s status needs a reason and signs the account out everywhere. Admin accounts can&apos;t be changed here.</p>
  <Dialog open={!!selected} onOpenChange={v=>{if(!v)setSelected(null);}}
   title={selected?(selected.status==="active"?"Suspend ":"Reactivate ")+selected.displayName:""}
   description="The reason is recorded in the audit log. The account is signed out everywhere.">
   {selected&&<form onSubmit={e=>void suspend(e)} className="space-y-3">
    <label className={label}>Audit reason (minimum 20 characters)
     <textarea rows={3} className={line} minLength={20} maxLength={500} required value={reason} onChange={e=>setReason(e.target.value)}/>
    </label>
    <ActionResult state={action}/>
    <div className="flex flex-wrap justify-end gap-2">
     <button type="button" className={secondary} onClick={()=>setSelected(null)}>Cancel</button>
     <button type="submit" className={primary} disabled={action.busy||reason.trim().length<20}>Confirm account change</button>
    </div>
   </form>}
  </Dialog>
 </Card>;
}
type TicketDetail=Ticket&{messages:Array<{id:string;body:string;visibility:string;createdAt:string}>};
const nextStatusLabel:Record<string,string>={IN_PROGRESS:"In progress",RESOLVED:"Resolved",CLOSED:"Closed"};
export function Support(){
 const list=useRows<Ticket>("/support/tickets?limit=50");
 const [selected,setSelected]=React.useState<Ticket|null>(null);
 const [detail,setDetail]=React.useState<TicketDetail|null>(null);
 const [error,setError]=React.useState(""),[reply,setReply]=React.useState(""),[visibility,setVisibility]=React.useState("PUBLIC");
 const [confirming,setConfirming]=React.useState(false);
 const statusAction=useAction(),messageAction=useAction();
 React.useEffect(()=>{
  if(!selected)return;
  let active=true;
  void api<TicketDetail>("/support/tickets/"+selected.id)
  .then(v=>{if(active){setDetail(v);setError("");}})
  .catch(e=>{if(active)setError(explain(e));});
  return ()=>{active=false;};
 },[selected]);
 const permitted=(status:string)=>status==="open"?"IN_PROGRESS":status==="in_progress"?"RESOLVED":status==="resolved"?"CLOSED":null;
 async function advance(){
  if(!detail)return;
  const next=permitted(detail.status);
  if(!next)return;
  const ok=await statusAction.mutate("/admin/support/tickets/"+detail.id,"PATCH",{
   expectedVersion:detail.version,status:next
  },"Ticket moved to "+(nextStatusLabel[next]??next).toLowerCase()+".");
  setConfirming(false);
  if(ok){setSelected(null);setDetail(null);list.refresh();}
 }
 async function message(e:React.FormEvent){
  e.preventDefault();if(!detail||!reply.trim())return;
  const ok=await messageAction.mutate("/support/tickets/"+detail.id+"/messages","POST",{
   body:reply.trim(),visibility
  },visibility==="PUBLIC"?"Reply sent to the ticket owner.":"Internal note saved.");
  if(ok){setReply("");setDetail(await api<TicketDetail>("/support/tickets/"+detail.id));}
 }
 const next=detail?permitted(detail.status):null;
 return <Card title="Support tickets" tools={<button className={secondary} onClick={list.refresh}>Refresh</button>}>
  <FetchState state={list} empty="No support tickets."/>
  <ActionResult state={statusAction}/>
  <Table caption="Support tickets" rows={list.rows} rowKey={t=>t.id} activeKey={selected?.id??null} cols={[
   {key:"s",header:"Subject",cell:t=><span className="font-medium">{t.subject}</span>},
   {key:"c",header:"Category",cell:t=>humanize(t.category)},
   {key:"o",header:"Opened",cell:t=><span className="tabular-nums">{date(t.createdAt)}</span>},
   {key:"st",header:"Status",cell:t=><Tag value={t.status}/>},
   {key:"a",header:"",cell:t=><button className={secondary} onClick={()=>{setSelected(t);setDetail(null);setError("");statusAction.clear();messageAction.clear();}}>Open</button>},
  ]}/>
  <Pager state={list}/>
  {selected&&<section aria-label="Selected ticket" className="space-y-3 rounded-md border border-signal p-4">
   {error&&<Alert type="error">{error}</Alert>}
   {!detail&&<p role="status" className="text-sm text-ink-muted">Loading ticket…</p>}
   {detail&&<>
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-heading font-semibold text-ink">{detail.subject}</h3><Tag value={detail.status}/></div>
    <p className="text-sm text-ink">{detail.description}</p>
    {detail.messages.length?<ul className="space-y-2">{detail.messages.map(m=><li key={m.id} className="rounded-md bg-paper p-3 text-sm">
     <div className="flex items-center justify-between gap-2"><Tag value={m.visibility}/><span className="text-ink-muted tabular-nums">{date(m.createdAt)}</span></div>
     <p className="mt-1 text-ink">{m.body}</p>
    </li>)}</ul>:<p className="text-sm text-ink-muted">No replies yet.</p>}
    {detail.status!=="closed"&&<form className="space-y-3" onSubmit={e=>void message(e)}>
     <label className={label}>Reply<textarea className={line} rows={3} required maxLength={2000} value={reply} onChange={e=>setReply(e.target.value)}/></label>
     <label className={label}>Who can see it<select className={line} value={visibility} onChange={e=>setVisibility(e.target.value)}>
      <option value="PUBLIC">The ticket owner</option><option value="INTERNAL">Admins only (internal note)</option>
     </select></label>
     <div className="flex flex-wrap gap-2">
      <button className={primary} disabled={messageAction.busy||!reply.trim()}>Save reply</button>
      {next&&<button type="button" className={secondary} disabled={statusAction.busy} onClick={()=>setConfirming(true)}>Advance ticket status</button>}
      <button type="button" className={secondary} onClick={()=>{setSelected(null);setDetail(null);}}>Close panel</button>
     </div>
     <ActionResult state={messageAction}/>
    </form>}
   </>}
  </section>}
  <Confirm open={confirming} onOpenChange={setConfirming} busy={statusAction.busy}
   title={next?"Move ticket to "+(nextStatusLabel[next]??next).toLowerCase()+"?":""}
   description="The ticket owner sees the new status." confirmLabel={next?"Move to "+(nextStatusLabel[next]??next).toLowerCase():"Confirm"}
   onConfirm={()=>void advance()}/>
 </Card>;
}
export function Analytics(){
 const [error,setError]=React.useState("");
 async function download(path:string,name:string){
  setError("");try{await downloadApiCsv(path,name);}catch(e){setError(explain(e));}
 }
 return <div className="space-y-4">
  <Overview/>
  <Card title="Downloads">
   <p className="text-sm text-ink-muted">CSV files of the recorded report and the audit log. Values that aren&apos;t confirmed by a provider are left out, not estimated.</p>
   <div className="flex flex-wrap gap-2">
    <button className={secondary} onClick={()=>void download("/admin/reports/export","blinkmyad-admin-report.csv")}>Download report (CSV)</button>
    <button className={secondary} onClick={()=>void download("/admin/audit-events/export","blinkmyad-admin-audit.csv")}>Download audit log (CSV)</button>
   </div>{error&&<Alert type="error">{error}</Alert>}
  </Card>
 </div>;
}
type AuditRow={id:string;actorUserId:string|null;action:string;resourceType:string;resourceId:string;createdAt:string};
export function Audit(){
 const rows=useRows<AuditRow>("/admin/audit-events?limit=30");
 const [error,setError]=React.useState("");
 async function exportCsv(){setError("");try{await downloadApiCsv("/admin/audit-events/export","blinkmyad-audit.csv");}catch(e){setError(explain(e));}}
 return <Card title="Audit log" tools={<div className="flex gap-2">
  <button className={secondary} onClick={rows.refresh}>Refresh</button><button className={secondary} onClick={()=>void exportCsv()}>Download CSV</button>
 </div>}>
  <p className="text-sm text-ink-muted">Every recorded admin and account action. Request contents with secrets are never stored here.</p>
  {error&&<Alert type="error">{error}</Alert>}
  <FetchState state={rows} empty="No audit events."/>
  <Table caption="Audit events" rows={rows.rows} rowKey={x=>x.id} cols={[
   {key:"w",header:"When",cell:x=><span className="whitespace-nowrap tabular-nums">{date(x.createdAt)}</span>},
   {key:"a",header:"Action",cell:x=><span className="font-mono text-xs">{x.action}</span>},
   {key:"r",header:"Record",cell:x=>humanize(x.resourceType)},
   {key:"i",header:"Record ID",cell:x=><span className="font-mono text-xs break-all text-ink-muted">{x.resourceId}</span>},
  ]}/>
  <Pager state={rows}/>
 </Card>;
}
type PaymentRow={id:string;orderId:string;amountPaise:number;status?:string;state?:string};
export function Payments(){
 const attempts=useRows<PaymentRow>("/payments?limit=50");
 const [issues,setIssues]=React.useState<unknown[]>([]),[error,setError]=React.useState("");
 React.useEffect(()=>{
  let active=true;
  void api<unknown[]>("/admin/finance/reconciliation").then(v=>{if(active)setIssues(v);}).catch(e=>{if(active)setError(explain(e));});
  return ()=>{active=false;};
 },[]);
 return <div className="space-y-4">
  <Alert type="warning">Online payments and refunds aren&apos;t switched on. A payment only counts as paid once the payment provider confirms it.</Alert>
  <Card title="Payment attempts"><FetchState state={attempts} empty="No payment attempts."/>
   <Table caption="Payment attempts" rows={attempts.rows} rowKey={x=>x.id} cols={[
    {key:"o",header:"Order",cell:x=><span className="font-mono text-xs">{x.orderId}</span>},
    {key:"s",header:"Status",cell:x=><Tag value={x.status??x.state}/>},
    {key:"a",header:"Amount",numeric:true,cell:x=>rupees(x.amountPaise)},
   ]}/>
   <Pager state={attempts}/>
  </Card>
  <Card title="Reconciliation exceptions">
   {error&&<Alert type="error">{error}</Alert>}
   <p className="text-sm text-ink tabular-nums">{issues.length} {issues.length===1?"exception":"exceptions"} found.</p>
   <p className="text-sm text-ink-muted">Fixing exceptions and issuing refunds stay switched off until the payment provider and finance approvals are in place.</p>
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
 return <Card title="Bookings">
  <p className="text-sm text-ink-muted">An approved campaign is not a booking: bookings appear only once screens are confirmed and paid for.</p>
  <FetchState state={approved} empty="No approved campaigns."/>
  <label className={label+" max-w-lg"}>Approved campaign<select value={selected} className={line} onChange={e=>setSelected(e.target.value)}>
   <option value="">Choose a campaign</option>{approved.rows.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}
  </select></label>
  {error&&<Alert type="error">{error}</Alert>}
  {selected&&<p className="text-sm text-ink tabular-nums">{bookings.length} recorded {bookings.length===1?"booking":"bookings"}.</p>}
  <Pager state={approved}/>
 </Card>;
}
export function Settlements(){
 return <Card title="Driver settlements">
  <Alert type="warning">Driver payouts aren&apos;t switched on. No payout can be approved using test or simulated provider records.</Alert>
  <p className="text-sm text-ink-muted">Creating settlements and releasing payouts become available once the payout provider and finance approvals are in place.</p>
 </Card>;
}
type NotificationRow={id:string;title:string;body:string;kind:string;readAt:string|null;createdAt:string};
export function Notifications(){
 const rows=useRows<NotificationRow>("/notifications?limit=50");
 const action=useAction();
 async function mark(id:string){
  const ok=await action.mutate("/notifications/"+id+"/read","POST",{},"Notification marked as read.");
  if(ok)rows.refresh();
 }
 return <Card title="Notifications" tools={<button className={secondary} onClick={rows.refresh}>Refresh</button>}>
  <FetchState state={rows} empty="No notifications."/>
  <ActionResult state={action}/>
  <Table caption="Notifications" rows={rows.rows} rowKey={n=>n.id} cols={[
   {key:"t",header:"Notification",cell:n=><><span className={n.readAt?"":"font-semibold"}>{!n.readAt&&<span className="sr-only">Unread: </span>}{n.title}</span><span className="block text-ink-muted">{n.body}</span></>},
   {key:"d",header:"Date",cell:n=><span className="whitespace-nowrap tabular-nums">{date(n.createdAt)}</span>},
   {key:"a",header:"",cell:n=>n.readAt?<Tag value="read"/>:<button className={secondary} disabled={action.busy} onClick={()=>void mark(n.id)}>Mark read</button>},
  ]}/>
  <Pager state={rows}/>
 </Card>;
}
export function Settings(){
 const [status,setStatus]=React.useState<{mode:string;externalProviders:string}|null>(null),[error,setError]=React.useState("");
 React.useEffect(()=>{let active=true;
  void api<{mode:string;externalProviders:string}>("/integrations/status")
   .then(v=>{if(active)setStatus(v);}).catch(e=>{if(active)setError(explain(e));});
  return ()=>{active=false;};
 },[]);
 return <Card title="Security and integrations">
  <p className="text-sm text-ink-muted">Admin sign-in always needs an authenticator code. Roles, account status and every admin action are checked and recorded by the server.</p>
  {error&&<Alert type="error">{error}</Alert>}
  <dl className="divide-y divide-line border-y border-line text-sm">
   <div className="flex flex-wrap items-center justify-between gap-2 py-2"><dt className="text-ink-muted">External services</dt><dd><Tag value={status?.mode==="mock"?"Test mode (simulated)":status?.mode==="live"?"Live":"Unavailable"}/></dd></div>
   <div className="flex flex-wrap items-center justify-between gap-2 py-2"><dt className="text-ink-muted">Provider status</dt><dd className="text-ink">{status?.externalProviders?humanize(status.externalProviders.toLowerCase()):"Unavailable"}</dd></div>
  </dl>
  <p className="text-sm text-ink-muted">Live payments, identity document checks, screen playback and payouts each need their own approved setup before they can be switched on.</p>
 </Card>;
}
