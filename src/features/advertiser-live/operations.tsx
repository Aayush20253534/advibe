"use client";
import * as React from "react";
import {api,newIdempotencyKey} from "@/services/api-client";
import {StatusTag,useAuth,useCollection,Panel,Notice,CollectionNotice,Pagination,field,label,primary,secondary,message,money,formatDate,
 type Campaign,type Site,type ScreenFormat,type Quote,type Payment} from "./common";
type Inventory={id:string;placement:string;locationId:string;location:string;city:string;zone:string;citySlug:string};
type UserProfile={id:string;displayName:string;email:string;city:string|null;roles:string[];status:string};
type Ticket={id:string;subject:string;description:string;status:string;category:string;businessId:string|null;createdAt:string};
type Notification={id:string;title:string;body:string;kind:string;readAt:string|null;createdAt:string};
const Tag=({name}:{name:string})=><StatusTag value={name}/>;
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
   body:{displayName:display.trim(),city:city.trim()||null}});setSuccess("Profile saved.");}
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
   <p className="text-sm text-ink-muted">Signed in as {profile?.email??"…"}</p>
   <form className="grid max-w-xl gap-4" onSubmit={e=>void saveProfile(e)}>
    <label className={label}>Display name<input required maxLength={100} className={field} value={display} onChange={e=>setDisplay(e.target.value)}/></label>
    <label className={label}>City<input maxLength={100} className={field} value={city} onChange={e=>setCity(e.target.value)}/></label>
    <button className={primary} disabled={busy||!profile}>Save profile</button>
   </form>
  </Panel>
  <Panel title={business&&!newBusiness?"Edit selected business":"Register business"} action={business&&<button type="button" className={secondary} onClick={()=>setNewBusiness(x=>!x)}>{newBusiness?"Cancel new business":"Add another business"}</button>}>
   <p className="text-sm text-ink-muted">{businesses.length} {businesses.length===1?"business":"businesses"} on this account. There is a limit to how many you can add.</p>
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
   <p className="text-sm text-ink-muted">AdVibe verifies businesses separately. Editing these details doesn&apos;t change the verification status.</p>
  </Panel>}
 </div>;
}
export function Directory({kind}:{kind:"locations"|"ad-formats"}){
 const sites=useCollection<Site>(kind==="locations"?"/public/locations?citySlug=prayagraj&limit=100":null);
 const formats=useCollection<ScreenFormat>(kind==="ad-formats"?"/public/formats?limit=100":null);
 const inventory=useCollection<Inventory>("/inventory/screens?citySlug=prayagraj&limit=100");
 const [search,setSearch]=React.useState("");
 return <div className="space-y-5">
  <Notice>A listed location or screen isn&apos;t a guarantee that it can be booked. Availability is confirmed when you request a quote in Billing and payments.</Notice>
  {kind==="locations"&&<Panel title="Locations">
   <label className={label}>Search Prayagraj area or location<input className={field+" max-w-lg"} value={search} onChange={e=>setSearch(e.target.value)}/></label>
   <CollectionNotice busy={sites.busy} error={sites.error} length={sites.rows.length}/>
   <div className="mt-4 grid gap-3 sm:grid-cols-2">
    {sites.rows.filter(s=>[s.name,s.city,s.zone].join(" ").toLowerCase().includes(search.toLowerCase())).map(s=><div key={s.id} className="rounded-lg border border-line p-4">
     <p className="font-bold text-ink">{s.name}</p><p className="mt-1 text-sm text-ink-muted">{s.zone}, {s.city}</p>
     <p className="mt-2 text-xs text-ink-muted">Published area. Screen and booking availability are confirmed separately.</p>
    </div>)}
   </div><Pagination hasPrevious={sites.hasPrevious} busy={sites.busy} next={sites.next} more={sites.more} first={sites.first}/>
  </Panel>}
  {kind==="ad-formats"&&<Panel title="Ad formats">
   <CollectionNotice busy={formats.busy} error={formats.error} length={formats.rows.length}/>
   <div className="grid gap-3 sm:grid-cols-2">{formats.rows.map(f=><div className="rounded-lg border border-line p-4" key={f.placement}>
    <p className="font-bold">{f.label}</p><p className="mt-2 text-sm text-ink-muted">{f.description}</p>
   </div>)}</div>
  </Panel>}
  <Panel title="Screens listed for Prayagraj">
   <CollectionNotice busy={inventory.busy} error={inventory.error} length={inventory.rows.length}/>
   <p className="text-sm text-ink-muted">Only the placement and location of each screen are shown. Driver details, device credentials and GPS positions are never shared.</p>
   <div className="grid gap-3 sm:grid-cols-2">{inventory.rows.filter(s=>[s.location,s.zone,s.city,s.placement].join(" ").toLowerCase().includes(search.toLowerCase())).map(s=>
    <div key={s.id} className="rounded-lg border border-line p-4">
     <p className="font-bold">{s.placement.replaceAll("_"," ")}</p>
     <p className="mt-1 text-sm text-ink-muted">{s.location} · {s.zone}, {s.city}</p>
     <p className="mt-2 break-all text-xs text-ink-subtle">Screen ID: {s.id}</p>
    </div>)}</div>
   <Pagination hasPrevious={inventory.hasPrevious} busy={inventory.busy} next={inventory.next} more={inventory.more} first={inventory.first}/>
  </Panel>
 </div>;
}
export function MoneyAndQuotes(){
 const {business,session}=useAuth();
 const campaigns=useCollection<Campaign>(business?"/campaigns?limit=100&businessId="+business.id:null);
 const screens=useCollection<Inventory>(business?"/inventory/screens?citySlug=prayagraj&limit=100":null);
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
   setSuccess("Quote ready: "+money(result.totalPaise)+", valid until "+formatDate(result.expiresAt)+".");
   quotes.refresh();
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 return <div className="space-y-5">
  <Panel title="Request a quote">
   <Notice>A quote prices one of your saved campaigns on the screens you choose, using current rates and tax. It doesn&apos;t reserve screens or charge you. If something needed for pricing is missing, the request is refused with the reason.</Notice>
   {!business?<Notice kind="warning">Register a business first.</Notice>:<form onSubmit={e=>void quote(e)} className="mt-5 space-y-4">
    <label className={label}>Campaign<select className={field} required value={campaignId} onChange={e=>setCampaignId(e.target.value)}>
     <option value="">Select a saved campaign</option>
     {campaigns.rows.map(c=><option key={c.id} value={c.id}>{c.title} ({c.status})</option>)}
    </select></label>
    {chosen&&<p className="text-xs text-ink-muted">Schedule: {chosen.startDate} to {chosen.endDate}; {chosen.weekdays.length} selected weekdays.</p>}
    <fieldset><legend className={label}>Choose screens</legend>
     <div className="mt-2 grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-line p-3">
      {screens.rows.map(s=><label key={s.id} className="flex gap-3 rounded-lg p-2 text-sm hover:bg-paper">
       <input type="checkbox" checked={selected.includes(s.id)} onChange={e=>setSelected(x=>e.target.checked?[...x,s.id]:x.filter(i=>i!==s.id))}/>
       <span><strong>{s.placement.replaceAll("_"," ")}</strong> · {s.location}, {s.city}</span>
      </label>)}
      {!screens.rows.length&&<p className="text-sm text-ink-muted">No screens are available to quote yet.</p>}
     </div>
    </fieldset>
    <label className={label}>Discount code (optional)<input maxLength={40} value={discount} className={field} onChange={e=>setDiscount(e.target.value)}/></label>
    <button className={primary} disabled={busy||!campaignId||!selected.length}>{busy?"Requesting…":"Request a quote"}</button>
   </form>}
   {screens.error&&<Notice kind="error">{screens.error}</Notice>}
   {campaigns.error&&<Notice kind="error">{campaigns.error}</Notice>}
   {error&&<Notice kind="error">{error}</Notice>}{success&&<Notice kind="success">{success}</Notice>}
  </Panel>
  <Panel title="Your quotes" action={<button className={secondary} onClick={quotes.refresh}>Refresh</button>}>
   <CollectionNotice busy={quotes.busy} error={quotes.error} length={quotes.rows.length}/>
   <div className="divide-y divide-line">
    {quotes.rows.map(q=><div key={q.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
     <div><p className="font-bold">{money(q.totalPaise)} · {q.currency}</p><p className="mt-1 text-xs text-ink-muted">Tax {money(q.taxPaise)} · expires {formatDate(q.expiresAt)}</p></div>
     <Tag name={q.reservationStatus}/>
    </div>)}
   </div>
  </Panel>
  <Panel title="Payment attempts" action={<button className={secondary} onClick={payments.refresh}>Refresh</button>}>
   <CollectionNotice busy={payments.busy} error={payments.error} length={payments.rows.length}/>
   <div className="divide-y divide-line">{payments.rows.map(p=><div key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
    <div><p className="font-bold">{money(p.amountPaise)}</p><p className="text-xs text-ink-muted">Payment order {p.orderId}</p></div>
    <Tag name={p.status??p.state??"unknown"}/>
   </div>)}</div>
   <Pagination hasPrevious={payments.hasPrevious} busy={payments.busy} next={payments.next} more={payments.more} first={payments.first}/>
   <Notice kind="warning">Online payment isn&apos;t available here yet. A payment only counts as paid once AdVibe confirms it with the payment provider.</Notice>
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
  <Notice>These figures count your saved campaigns (up to 100). They don&apos;t estimate reach, impressions, revenue or settlements.</Notice>
  <Panel title="Campaigns by status" action={<button className={secondary} onClick={exportCsv} disabled={!campaigns.rows.length}>Download campaigns as CSV</button>}>
   <CollectionNotice busy={campaigns.busy} error={campaigns.error} length={campaigns.rows.length}/>
   <div className="grid gap-3 sm:grid-cols-3">
    {["draft","submitted","changes_requested","approved","rejected","cancelled"].map(x=><div key={x} className="rounded-lg border border-line p-4">
     <p className="text-xs font-semibold capitalize text-ink-muted">{x.replaceAll("_"," ")}</p>
     <p className="mt-2 text-2xl font-extrabold">{counts[x]??0}</p>
    </div>)}
   </div>
  </Panel>
  <Panel title="Payments">
   <CollectionNotice busy={payments.busy} error={payments.error} length={payments.rows.length}/>
   <p className="text-sm text-ink-muted">{payments.rows.length} recorded payment {payments.rows.length===1?"attempt":"attempts"}. Attempts are not confirmed revenue; only payments confirmed with the provider count.</p>
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
  <div className="divide-y divide-line">{notifications.rows.map(n=><div key={n.id} className="py-4">
   <div className="flex flex-wrap items-start justify-between gap-3"><div>
    <p className="font-bold">{n.title}</p><p className="mt-1 text-sm text-ink-muted">{n.body}</p>
    <p className="mt-2 text-xs text-ink-subtle">{formatDate(n.createdAt)}</p></div>
    {n.readAt?<Tag name="read"/>:<button className={secondary} disabled={busy===n.id} onClick={()=>void read(n.id)}>Mark read</button>}
   </div>
  </div>)}</div><Pagination hasPrevious={notifications.hasPrevious} busy={notifications.busy} next={notifications.next} more={notifications.more} first={notifications.first}/>
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
  <Panel title="Contact support">
   <form className="max-w-2xl space-y-4" onSubmit={e=>void create(e)}>
    <label className={label}>Category<select className={field} value={category} onChange={e=>setCategory(e.target.value)}>
     <option value="GENERAL">General</option><option value="BILLING">Billing</option>
    </select></label>
    <label className={label}>Subject<input required minLength={5} maxLength={160} className={field} value={subject} onChange={e=>setSubject(e.target.value)}/></label>
    <label className={label}>Describe the issue<textarea required minLength={12} maxLength={2000} rows={4} className={field} value={description} onChange={e=>setDescription(e.target.value)}/></label>
    <button className={primary} disabled={busy}>Send to support</button>
   </form>
   {error&&<Notice kind="error">{error}</Notice>}{success&&<Notice kind="success">{success}</Notice>}
  </Panel>
  <Panel title="Your tickets" action={<button className={secondary} onClick={tickets.refresh}>Refresh</button>}>
   <CollectionNotice busy={tickets.busy} error={tickets.error} length={tickets.rows.length}/>
   <div className="divide-y divide-line">{tickets.rows.map(t=><div key={t.id} className="py-4">
    <div className="flex flex-wrap justify-between gap-3"><div><p className="font-bold">{t.subject}</p>
     <p className="mt-1 text-sm text-ink-muted">{t.description}</p></div><Tag name={t.status}/></div>
    <button className={secondary+" mt-3"} onClick={()=>setSelected(t.id)}>Reply to ticket</button>
    {selected===t.id&&<form onSubmit={e=>void respond(e)} className="mt-4 space-y-3">
     <label className={label}>Message<textarea required maxLength={2000} className={field} rows={3} value={reply} onChange={e=>setReply(e.target.value)}/></label>
     <button className={primary} disabled={busy||!reply.trim()}>Send message</button>
    </form>}
   </div>)}</div><Pagination hasPrevious={tickets.hasPrevious} busy={tickets.busy} next={tickets.next} more={tickets.more} first={tickets.first}/>
  </Panel>
 </div>;
}
