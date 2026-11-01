"use client";
import * as React from "react";
import {api,newIdempotencyKey} from "@/services/api-client";
import {useAuth,useCollection,Panel,Notice,CollectionNotice,Pagination,field,label,primary,secondary,message,money,formatDate,
 type Campaign,type Site,type ScreenFormat,type Quote,type Payment} from "./common";
type Inventory={id:string;placement:string;locationId:string;location:string;city:string;zone:string;citySlug:string};
type UserProfile={id:string;displayName:string;email:string;city:string|null;roles:string[];status:string};
type Ticket={id:string;subject:string;description:string;status:string;category:string;businessId:string|null;createdAt:string};
type Notification={id:string;title:string;body:string;kind:string;readAt:string|null;createdAt:string};
const Tag=({name}:{name:string})=><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-800">{name.replaceAll("_"," ")}</span>;
export function BusinessSettings(){
 const {session,business,businesses,reloadBusinesses}=useAuth();
 const [profile,setProfile]=React.useState<UserProfile|null>(null);
 const [display,setDisplay]=React.useState(""),[city,setCity]=React.useState("");
 const [brand,setBrand]=React.useState(""),[slug,setSlug]=React.useState(""),[brandCity,setBrandCity]=React.useState(""),[legal,setLegal]=React.useState("");
 const [busy,setBusy]=React.useState(false),[error,setError]=React.useState(""),[success,setSuccess]=React.useState("");
 const [newBusiness,setNewBusiness]=React.useState(false);
 React.useEffect(()=>{let active=true;void api<UserProfile>("/me").then(u=>{if(active){setProfile(u);setDisplay(u.displayName);setCity(u.city??"");}}).catch(e=>{if(active)setError(message(e));});return ()=>{active=false;};},[]);
 React.useEffect(()=>{let active=true;void Promise.resolve().then(()=>{if(active){setBrand(newBusiness?"":business?.displayName??"");setBrandCity(newBusiness?"":business?.city??"");setLegal(newBusiness?"":business?.legalName??"");}});return ()=>{active=false;};},[business?.id,business?.displayName,business?.city,business?.legalName,newBusiness]);
 async function saveProfile(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError("");setSuccess("");
  try{await api("/me",{method:"PATCH",csrfToken:session.csrfToken,
   body:{displayName:display.trim(),city:city.trim()||null}});setSuccess("Account updated from backend.");}
  catch(e){setError(message(e));}finally{setBusy(false);}
 }
 async function saveBusiness(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError("");setSuccess("");
  try{
   if(business&&!newBusiness)await api("/businesses/"+business.id,{method:"PATCH",csrfToken:session.csrfToken,
    body:{displayName:brand.trim(),city:brandCity.trim()||null,legalName:legal.trim()||null}});
   else await api("/businesses",{method:"POST",csrfToken:session.csrfToken,
    body:{slug:slug.trim().toLowerCase(),displayName:brand.trim(),city:brandCity.trim(),
     ...(legal.trim()?{legalName:legal.trim()}:{})}});
   await reloadBusinesses();setSuccess("Business saved to your account.");setSlug("");setNewBusiness(false);
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 return <div className="space-y-5">
  {error&&<Notice kind="error">{error}</Notice>}{success&&<Notice kind="success">{success}</Notice>}
  <Panel title="Profile">
   <p className="mb-4 text-sm text-slate-500">{profile?.email??"Loading account…"} · Role: advertiser</p>
   <form className="grid max-w-xl gap-4" onSubmit={e=>void saveProfile(e)}>
    <label className={label}>Display name<input required maxLength={100} className={field} value={display} onChange={e=>setDisplay(e.target.value)}/></label>
    <label className={label}>City<input maxLength={100} className={field} value={city} onChange={e=>setCity(e.target.value)}/></label>
    <button className={primary} disabled={busy||!profile}>Save profile</button>
   </form>
  </Panel>
  <Panel title={business&&!newBusiness?"Edit selected business":"Register business"} action={business&&<button type="button" className={secondary} onClick={()=>setNewBusiness(x=>!x)}>{newBusiness?"Cancel new business":"Add another business"}</button>}>
   <p className="mb-4 text-sm text-slate-600">{businesses.length} business account(s) associated with your login. Accounts have a backend-enforced limit.</p>
   <form className="grid max-w-xl gap-4" onSubmit={e=>void saveBusiness(e)}>
    {(!business||newBusiness)&&<label className={label}>Unique business slug<input required minLength={2} maxLength={100}
      pattern="[a-z0-9]+(-[a-z0-9]+)*" className={field} value={slug} onChange={e=>setSlug(e.target.value.toLowerCase())}
      placeholder="my-business"/></label>}
    <label className={label}>Business name<input required maxLength={160} className={field} value={brand} onChange={e=>setBrand(e.target.value)}/></label>
    <label className={label}>Business city<input required={!business||newBusiness} maxLength={100} className={field} value={brandCity} onChange={e=>setBrandCity(e.target.value)}/></label>
    <label className={label}>Legal name (optional)<input maxLength={220} className={field} value={legal} onChange={e=>setLegal(e.target.value)}/></label>
    <button className={primary} disabled={busy}>{business&&!newBusiness?"Update selected business":"Register business"}</button>
   </form>
  </Panel>
  {business&&!newBusiness&&<Panel title="Business verification">
   <Tag name={business.verificationStatus}/>
   <p className="mt-3 text-sm text-slate-600">Business approval is controlled by the backend. Editing a business does not automatically verify it.</p>
  </Panel>}
 </div>;
}
export function Directory({kind}:{kind:"locations"|"ad-formats"}){
 const sites=useCollection<Site>(kind==="locations"?"/public/locations?limit=100":null);
 const formats=useCollection<ScreenFormat>(kind==="ad-formats"?"/public/formats?limit=100":null);
 const inventory=useCollection<Inventory>("/inventory/screens?limit=100");
 const [search,setSearch]=React.useState("");
 return <div className="space-y-5">
  <Notice>Listings come from the backend. A published location or paired screen does not guarantee bookable inventory or an approved quote.</Notice>
  {kind==="locations"&&<Panel title="Published locations">
   <label className={label}>Search city, zone or location<input className={field+" max-w-lg"} value={search} onChange={e=>setSearch(e.target.value)}/></label>
   <CollectionNotice busy={sites.busy} error={sites.error} length={sites.rows.length}/>
   <div className="mt-4 grid gap-3 sm:grid-cols-2">
    {sites.rows.filter(s=>[s.name,s.city,s.zone].join(" ").toLowerCase().includes(search.toLowerCase())).map(s=><div key={s.id} className="rounded-xl border border-slate-200 p-4">
     <p className="font-bold text-[#103459]">{s.name}</p><p className="mt-1 text-sm text-slate-600">{s.zone}, {s.city}</p>
     <p className="mt-2 text-xs text-slate-500">Coordinates: {s.lat}, {s.lng}</p>
    </div>)}
   </div><Pagination busy={sites.busy} next={sites.next} more={sites.more} first={sites.first}/>
  </Panel>}
  {kind==="ad-formats"&&<Panel title="Supported ad formats">
   <CollectionNotice busy={formats.busy} error={formats.error} length={formats.rows.length}/>
   <div className="grid gap-3 sm:grid-cols-2">{formats.rows.map(f=><div className="rounded-xl border border-slate-200 p-4" key={f.placement}>
    <p className="font-bold">{f.label}</p><p className="mt-2 text-sm text-slate-500">{f.description}</p>
   </div>)}</div>
  </Panel>}
  <Panel title="Eligible screen catalog">
   <CollectionNotice busy={inventory.busy} error={inventory.error} length={inventory.rows.length}/>
   <p className="mb-3 text-xs text-slate-500">Only sanitized placement and location metadata is returned. Driver identities, device credentials and GPS are not exposed.</p>
   <div className="grid gap-3 sm:grid-cols-2">{inventory.rows.filter(s=>[s.location,s.zone,s.city,s.placement].join(" ").toLowerCase().includes(search.toLowerCase())).map(s=>
    <div key={s.id} className="rounded-xl border border-blue-100 bg-[#fbfdff] p-4">
     <p className="font-bold">{s.placement.replaceAll("_"," ")}</p>
     <p className="mt-1 text-sm text-slate-600">{s.location} · {s.zone}, {s.city}</p>
     <p className="mt-2 break-all text-xs text-slate-400">Screen ID: {s.id}</p>
    </div>)}</div>
   <Pagination busy={inventory.busy} next={inventory.next} more={inventory.more} first={inventory.first}/>
  </Panel>
 </div>;
}
export function MoneyAndQuotes(){
 const {business,session}=useAuth();
 const campaigns=useCollection<Campaign>(business?"/campaigns?limit=100&businessId="+business.id:null);
 const screens=useCollection<Inventory>(business?"/inventory/screens?limit=100":null);
 const quotes=useCollection<Quote>(business?"/pricing/quotes?businessId="+business.id:null);
 const payments=useCollection<Payment>("/payments?limit=50");
 const [campaignId,setCampaignId]=React.useState("");
 const [selected,setSelected]=React.useState<string[]>([]);
 const [discount,setDiscount]=React.useState("");
 const [busy,setBusy]=React.useState(false),[error,setError]=React.useState(""),[success,setSuccess]=React.useState("");

 const chosen=campaigns.rows.find(c=>c.id===campaignId);
 async function quote(e:React.FormEvent){
  e.preventDefault();if(!business||!chosen||!selected.length)return;
  setBusy(true);setError("");setSuccess("");
  try{
   const result=await api<Quote>("/pricing/quotes",{method:"POST",csrfToken:session.csrfToken,
    idempotencyKey:newIdempotencyKey(),body:{
     businessId:business.id,campaignId:chosen.id,screenIds:selected,
     startDate:chosen.startDate,endDate:chosen.endDate,weekdays:chosen.weekdays,
     ...(discount.trim()?{discountCode:discount.trim().toUpperCase()}:{})
    }});
   setSuccess("Real quote generated: "+money(result.totalPaise)+". Expires "+formatDate(result.expiresAt)+".");
   quotes.refresh();
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 return <div className="space-y-5">
  <Panel title="Request a priced quote">
   <Notice>Quotes use live screen records, effective rate rules and an approved tax policy. If any prerequisite is missing, the backend rejects the request. Quotes are not reservations and do not charge a customer.</Notice>
   {!business?<Notice kind="warning">Register a business first.</Notice>:<form onSubmit={e=>void quote(e)} className="mt-5 space-y-4">
    <label className={label}>Campaign<select className={field} required value={campaignId} onChange={e=>setCampaignId(e.target.value)}>
     <option value="">Select a saved campaign</option>
     {campaigns.rows.map(c=><option key={c.id} value={c.id}>{c.title} ({c.status})</option>)}
    </select></label>
    {chosen&&<p className="text-xs text-slate-600">Schedule: {chosen.startDate} to {chosen.endDate}; {chosen.weekdays.length} selected weekdays.</p>}
    <fieldset><legend className={label}>Choose screens</legend>
     <div className="mt-2 grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
      {screens.rows.map(s=><label key={s.id} className="flex gap-3 rounded-lg p-2 text-sm hover:bg-slate-50">
       <input type="checkbox" checked={selected.includes(s.id)} onChange={e=>setSelected(x=>e.target.checked?[...x,s.id]:x.filter(i=>i!==s.id))}/>
       <span><strong>{s.placement.replaceAll("_"," ")}</strong> · {s.location}, {s.city}</span>
      </label>)}
      {!screens.rows.length&&<p className="text-sm text-slate-500">No verified eligible paired screens have been published.</p>}
     </div>
    </fieldset>
    <label className={label}>Discount code (optional)<input maxLength={40} value={discount} className={field} onChange={e=>setDiscount(e.target.value)}/></label>
    <button className={primary} disabled={busy||!campaignId||!selected.length}>{busy?"Requesting…":"Get live quote"}</button>
   </form>}
   {screens.error&&<Notice kind="error">{screens.error}</Notice>}
   {campaigns.error&&<Notice kind="error">{campaigns.error}</Notice>}
   {error&&<Notice kind="error">{error}</Notice>}{success&&<Notice kind="success">{success}</Notice>}
  </Panel>
  <Panel title="Your quote history" action={<button className={secondary} onClick={quotes.refresh}>Refresh</button>}>
   <CollectionNotice busy={quotes.busy} error={quotes.error} length={quotes.rows.length}/>
   <div className="divide-y divide-slate-100">
    {quotes.rows.map(q=><div key={q.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
     <div><p className="font-bold">{money(q.totalPaise)} · {q.currency}</p><p className="mt-1 text-xs text-slate-500">Tax {money(q.taxPaise)} · expires {formatDate(q.expiresAt)}</p></div>
     <Tag name={q.reservationStatus}/>
    </div>)}
   </div>
  </Panel>
  <Panel title="Payment attempts" action={<button className={secondary} onClick={payments.refresh}>Refresh</button>}>
   <CollectionNotice busy={payments.busy} error={payments.error} length={payments.rows.length}/>
   <div className="divide-y divide-slate-100">{payments.rows.map(p=><div key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
    <div><p className="font-bold">{money(p.amountPaise)}</p><p className="text-xs text-slate-500">Payment order {p.orderId}</p></div>
    <Tag name={p.status??p.state??"unknown"}/>
   </div>)}</div>
   <Pagination busy={payments.busy} next={payments.next} more={payments.more} first={payments.first}/>
   <Notice kind="warning">Creating payment orders, launching Cashfree checkout and confirming bookings belong to Part 6. No client-side success status is treated as paid until the backend verifies provider reconciliation.</Notice>
  </Panel>
 </div>;
}
export function Reports(){
 const {business}=useAuth();
 const campaigns=useCollection<Campaign>(business?"/campaigns?limit=100&businessId="+business.id:null);
 const payments=useCollection<Payment>("/payments?limit=50");
 const counts=React.useMemo(()=>campaigns.rows.reduce<Record<string,number>>((acc,c)=>{acc[c.status]=(acc[c.status]??0)+1;return acc;},{}),[campaigns.rows]);
 function exportCsv(){
  // Only currently fetched account-scoped campaign rows. Never invent delivery estimates.
  const safe=(v:string)=>'"'+(/^[\s]*[=+@-]/.test(v)?"'"+v:v).replaceAll('"','""')+'"';
  const rows=[["Campaign","Status","Start","End","Revision"],...campaigns.rows.map(c=>[c.title,c.status,c.startDate,c.endDate,String(c.revision)])];
  const csv="\uFEFF"+rows.map(row=>row.map(safe).join(",")).join("\r\n")+"\r\n";
  const link=document.createElement("a"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
  link.href=url;link.download="advibe-advertiser-campaigns.csv";link.click();URL.revokeObjectURL(url);
 }
 return <div className="space-y-5">
  <Notice>Campaign figures are derived from currently fetched persisted records (maximum 100 on this page). No estimated reach, human impressions, revenue or bank settlements are inferred.</Notice>
  <Panel title="Campaign status breakdown" action={<button className={secondary} onClick={exportCsv} disabled={!campaigns.rows.length}>Export real campaign CSV</button>}>
   <CollectionNotice busy={campaigns.busy} error={campaigns.error} length={campaigns.rows.length}/>
   <div className="grid gap-3 sm:grid-cols-3">
    {["draft","submitted","changes_requested","approved","rejected","cancelled"].map(x=><div key={x} className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
     <p className="text-xs font-semibold capitalize text-slate-500">{x.replaceAll("_"," ")}</p>
     <p className="mt-2 text-2xl font-extrabold">{counts[x]??0}</p>
    </div>)}
   </div>
  </Panel>
  <Panel title="Financial evidence">
   <CollectionNotice busy={payments.busy} error={payments.error} length={payments.rows.length}/>
   <p className="mt-3 text-sm text-slate-600">Fetched {payments.rows.length} recorded payment attempts. This is not confirmed revenue. Only independently verified paid orders and refunds may be included in formal financial reporting.</p>
  </Panel>
 </div>;
}
export function AccountNotifications(){
 const {session}=useAuth();
 const notifications=useCollection<Notification>("/notifications?limit=50");
 const [busy,setBusy]=React.useState(""),[error,setError]=React.useState("");
 async function read(id:string){
  setBusy(id);setError("");
  try{await api("/notifications/"+id+"/read",{method:"POST",csrfToken:session.csrfToken,body:{}});notifications.refresh();}
  catch(e){setError(message(e));}finally{setBusy("");}
 }
 return <Panel title="Your notifications" action={<button className={secondary} onClick={notifications.refresh}>Refresh</button>}>
  <CollectionNotice busy={notifications.busy} error={notifications.error} length={notifications.rows.length}/>
  {error&&<Notice kind="error">{error}</Notice>}
  <div className="divide-y divide-slate-100">{notifications.rows.map(n=><div key={n.id} className="py-4">
   <div className="flex flex-wrap items-start justify-between gap-3"><div>
    <p className="font-bold">{n.title}</p><p className="mt-1 text-sm text-slate-600">{n.body}</p>
    <p className="mt-2 text-xs text-slate-400">{formatDate(n.createdAt)}</p></div>
    {n.readAt?<Tag name="read"/>:<button className={secondary} disabled={busy===n.id} onClick={()=>void read(n.id)}>Mark read</button>}
   </div>
  </div>)}</div><Pagination busy={notifications.busy} next={notifications.next} more={notifications.more} first={notifications.first}/>
 </Panel>;
}
export function AccountSupport(){
 const {business,session}=useAuth();
 const tickets=useCollection<Ticket>("/support/tickets?limit=50");
 const [subject,setSubject]=React.useState(""),[description,setDescription]=React.useState("");
 const [category,setCategory]=React.useState("GENERAL");
 const [selected,setSelected]=React.useState<string|null>(null);
 const [reply,setReply]=React.useState("");
 const [busy,setBusy]=React.useState(false),[error,setError]=React.useState(""),[success,setSuccess]=React.useState("");
 async function create(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError("");setSuccess("");
  try{await api("/support/tickets",{method:"POST",csrfToken:session.csrfToken,
   idempotencyKey:newIdempotencyKey(),body:{category,subject:subject.trim(),description:description.trim(),
    ...(business?{businessId:business.id}:{})}});
   setSubject("");setDescription("");setSuccess("Support ticket submitted.");tickets.refresh();
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 async function respond(e:React.FormEvent){
  e.preventDefault();if(!selected)return;setBusy(true);setError("");setSuccess("");
  try{await api("/support/tickets/"+selected+"/messages",{method:"POST",csrfToken:session.csrfToken,
   idempotencyKey:newIdempotencyKey(),body:{body:reply.trim(),visibility:"PUBLIC"}});
   setReply("");setSuccess("Message added to support ticket.");setSelected(null);tickets.refresh();
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 return <div className="space-y-5">
  <Panel title="Open support ticket">
   <form className="max-w-2xl space-y-4" onSubmit={e=>void create(e)}>
    <label className={label}>Category<select className={field} value={category} onChange={e=>setCategory(e.target.value)}>
     <option value="GENERAL">General</option><option value="BILLING">Billing</option>
    </select></label>
    <label className={label}>Subject<input required minLength={5} maxLength={160} className={field} value={subject} onChange={e=>setSubject(e.target.value)}/></label>
    <label className={label}>Describe the issue<textarea required minLength={12} maxLength={2000} rows={4} className={field} value={description} onChange={e=>setDescription(e.target.value)}/></label>
    <button className={primary} disabled={busy}>Submit ticket</button>
   </form>
   {error&&<Notice kind="error">{error}</Notice>}{success&&<Notice kind="success">{success}</Notice>}
  </Panel>
  <Panel title="Existing tickets" action={<button className={secondary} onClick={tickets.refresh}>Refresh</button>}>
   <CollectionNotice busy={tickets.busy} error={tickets.error} length={tickets.rows.length}/>
   <div className="divide-y divide-slate-100">{tickets.rows.map(t=><div key={t.id} className="py-4">
    <div className="flex flex-wrap justify-between gap-3"><div><p className="font-bold">{t.subject}</p>
     <p className="mt-1 text-sm text-slate-600">{t.description}</p></div><Tag name={t.status}/></div>
    <button className={secondary+" mt-3"} onClick={()=>setSelected(t.id)}>Reply to ticket</button>
    {selected===t.id&&<form onSubmit={e=>void respond(e)} className="mt-4 space-y-3">
     <label className={label}>Message<textarea required maxLength={2000} className={field} rows={3} value={reply} onChange={e=>setReply(e.target.value)}/></label>
     <button className={primary} disabled={busy||!reply.trim()}>Send message</button>
    </form>}
   </div>)}</div><Pagination busy={tickets.busy} next={tickets.next} more={tickets.more} first={tickets.first}/>
  </Panel>
 </div>;
}
