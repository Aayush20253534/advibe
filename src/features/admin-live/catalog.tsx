"use client";
import * as React from "react";
import {Card,Alert,Tag,FetchState,Pager,ActionResult,useRows,useAction,line,label,primary,secondary,rupees} from "./common";
type City={id:string;name:string;slug:string;countryCode:string;timeZone:string;state:string};
type Zone={id:string;cityId:string;name:string;slug:string;centerLat:number;centerLng:number;radiusMeters:number;state:string};
type Site={id:string;zoneId:string;name:string;slug:string;lat:number;lng:number;state:string};
type Rate={id:string;cityId:string;placement:string;version:number;ratePaisePerScreenDay:number|null;active:boolean;validFrom:string;validTo:string};
type Tax={id:string;version:string;taxBps:number;active:boolean;validFrom:string;validTo:string;sourceReference:string};
type Screen={id:string;vehicleId:string;placement:string;state:string;locationId?:string|null};
const placements=["bike_rear","auto_rear","auto_side","car_rear","car_interior","helmet"];
function selectState(current:string){
 if(current==="draft")return "published";
 if(current==="published")return "archived";
 return null;
}
export function Geo(){
 const cities=useRows<City>("/admin/cities"),zones=useRows<Zone>("/admin/zones"),sites=useRows<Site>("/admin/locations?limit=100");
 const action=useAction();
 const [tab,setTab]=React.useState<"city"|"zone"|"location">("city");
 const [name,setName]=React.useState(""),[slug,setSlug]=React.useState("");
 const [cityId,setCityId]=React.useState(""),[zoneId,setZoneId]=React.useState("");
 const [country,setCountry]=React.useState("IN"),[timeZone,setTimeZone]=React.useState("Asia/Kolkata");
 const [lat,setLat]=React.useState(""),[lng,setLng]=React.useState(""),[radius,setRadius]=React.useState("2000");
 const [pending,setPending]=React.useState("");
 const refresh=()=>{cities.refresh();zones.refresh();sites.refresh();};
 async function create(e:React.FormEvent){
  e.preventDefault();if(!name.trim()||!slug.trim())return;
  const body=tab==="city"?{name:name.trim(),slug:slug.trim(),countryCode:country.toUpperCase(),timeZone}:
   tab==="zone"?{cityId,name:name.trim(),slug:slug.trim(),centerLat:Number(lat),centerLng:Number(lng),radiusMeters:Number(radius)}:
    {zoneId,name:name.trim(),slug:slug.trim(),lat:Number(lat),lng:Number(lng)};
  if(tab!=="city"&&(!lat.trim()||!lng.trim()))return;
  const endpoint="/admin/"+(tab==="city"?"cities":tab==="zone"?"zones":"locations");
  const ok=await action.mutate(endpoint,"POST",body,"Catalog entry saved as an unpublished draft.");
  if(ok){setName("");setSlug("");refresh();}
 }
 async function transition(kind:"city"|"zone"|"location",id:string,current:string){
  const next=selectState(current);
  if(!next)return;
  setPending(id);
  const confirm=window.confirm("Change "+kind+" from "+current+" to "+next+"? This affects which inventory is visible.");
  if(confirm){
   const endpoint=kind==="city"?"cities":kind==="zone"?"zones":"locations";
   const ok=await action.mutate("/admin/"+endpoint+"/"+id,"PATCH",{state:next},"Catalog state updated.");
   if(ok)refresh();
  }
  setPending("");
 }
 return <div className="space-y-5">
  <Alert>Locations, zones and cities are real database records. New records start as drafts. The backend verifies geographic boundaries, parent publication and state transitions.</Alert>
  <Card title="Create catalog entry">
   <div className="flex flex-wrap gap-2">{(["city","zone","location"] as const).map(k=>
    <button key={k} className={tab===k?primary:secondary} onClick={()=>setTab(k)}>{k}</button>)}</div>
   <form onSubmit={e=>void create(e)} className="mt-4 grid max-w-3xl gap-4 sm:grid-cols-2">
    <label className={label}>Display name<input className={line} required maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></label>
    <label className={label}>URL slug<input className={line} required pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={2} maxLength={100}
     value={slug} onChange={e=>setSlug(e.target.value.toLowerCase())}/></label>
    {tab==="city"?<>
     <label className={label}>Country ISO-2<input className={line} required pattern="[A-Z]{2}" maxLength={2} value={country} onChange={e=>setCountry(e.target.value.toUpperCase())}/></label>
     <label className={label}>IANA time zone<input className={line} required value={timeZone} onChange={e=>setTimeZone(e.target.value)}/></label>
    </>:<>
     <label className={label}>{tab==="zone"?"Parent city":"Parent zone"}<select required className={line} value={tab==="zone"?cityId:zoneId}
      onChange={e=>tab==="zone"?setCityId(e.target.value):setZoneId(e.target.value)}>
      <option value="">Select parent</option>{tab==="zone"?cities.rows.filter(x=>x.state!=="archived").map(x=><option key={x.id} value={x.id}>{x.name}</option>):
       zones.rows.filter(x=>x.state!=="archived").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
     </select></label>
     <label className={label}>Latitude<input type="number" step="any" min={-90} max={90} required className={line} value={lat} onChange={e=>setLat(e.target.value)}/></label>
     <label className={label}>Longitude<input type="number" step="any" min={-180} max={180} required className={line} value={lng} onChange={e=>setLng(e.target.value)}/></label>
     {tab==="zone"&&<label className={label}>Radius in meters<input type="number" min={100} max={50000} step={1} className={line} value={radius} onChange={e=>setRadius(e.target.value)}/></label>}
    </>}
    <div className="sm:col-span-2"><button disabled={action.busy} className={primary}>{action.busy?"Saving…":"Save unpublished draft"}</button></div>
   </form>
   <ActionResult state={action}/>
  </Card>
  <Card title="Cities" tools={<button className={secondary} onClick={refresh}>Refresh all</button>}>
   <FetchState state={cities}/>
   <div className="divide-y divide-slate-100">{cities.rows.map(x=><div key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
    <span><strong>{x.name}</strong> · {x.timeZone} · {x.slug}</span>
    <span className="flex items-center gap-2"><Tag value={x.state}/>
     {selectState(x.state)&&<button className={secondary} disabled={action.busy||pending===x.id} onClick={()=>void transition("city",x.id,x.state)}>{selectState(x.state)}</button>}
    </span>
   </div>)}</div>
  </Card>
  <Card title="Zones"><FetchState state={zones}/>
   <div className="divide-y divide-slate-100">{zones.rows.map(x=><div key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
    <span><strong>{x.name}</strong> · {x.radiusMeters}m</span>
    <span className="flex items-center gap-2"><Tag value={x.state}/>
     {selectState(x.state)&&<button className={secondary} disabled={action.busy||pending===x.id} onClick={()=>void transition("zone",x.id,x.state)}>{selectState(x.state)}</button>}
    </span>
   </div>)}</div>
  </Card>
  <Card title="Physical locations"><FetchState state={sites}/>
   <div className="divide-y divide-slate-100">{sites.rows.map(x=><div key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
    <span><strong>{x.name}</strong> · {x.lat}, {x.lng}</span>
    <span className="flex items-center gap-2"><Tag value={x.state}/>
     {selectState(x.state)&&<button className={secondary} disabled={action.busy||pending===x.id} onClick={()=>void transition("location",x.id,x.state)}>{selectState(x.state)}</button>}
    </span>
   </div>)}</div><Pager state={sites}/>
  </Card>
 </div>;
}
export function Screens(){
 const screens=useRows<Screen>("/screens?limit=100");
 const locations=useRows<Site>("/admin/locations?limit=100");
 const [selected,setSelected]=React.useState(""),[location,setLocation]=React.useState("");
 const [view,setView]=React.useState<{screenId:string;lastHeartbeatAt:string|null;status:string}|null>(null);
 const [error,setError]=React.useState("");
 const action=useAction();
 async function assign(){
  if(!selected)return;
  const ok=await action.mutate("/admin/screens/"+selected+"/location","PUT",
   {locationId:location||null},"Screen location assignment updated.");
  if(ok){screens.refresh();setSelected("");}
 }
 async function inspect(id:string){
  setError("");setView(null);
  try{
   const {api}=await import("@/services/api-client");
   const result=await api<{screenId:string;lastHeartbeatAt:string|null;status:string}>("/admin/devices/"+id+"/player-status");
   setView(result);
  }catch(e){setError(e instanceof Error?e.message:"Player status unavailable";}
 }
 return <div className="space-y-5">
  <Alert type="warning">Screen pairing, keys, firmware trust and live delivery are hardware-specific operations. Part 7 controls activation. This page does not issue pairing credentials.</Alert>
  <Card title="Registered screens" tools={<button className={secondary} onClick={screens.refresh}>Refresh</button>}>
   <FetchState state={screens}/>
   <div className="divide-y divide-slate-100">{screens.rows.map(s=><div key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
    <div><p className="font-semibold">{s.placement.replaceAll("_"," ")}</p><p className="break-all text-xs text-slate-500">{s.id}</p></div>
    <div className="flex items-center gap-2"><Tag value={s.state}/>
     <button className={secondary} onClick={()=>{setSelected(s.id);setLocation(s.locationId??"");}}>Assign location</button>
     <button className={secondary} onClick={()=>void inspect(s.id)}>Player status</button>
    </div>
   </div>)}</div>
   {view&&<Alert>Device {view.screenId}: {view.status} · Last heartbeat {view.lastHeartbeatAt??"Not recorded"}.</Alert>}
   {error&&<Alert type="error">{error}</Alert>}
  </Card>
  {selected&&<Card title="Change screen location">
   <label className={label}>Published location<select className={line} value={location} onChange={e=>setLocation(e.target.value)}>
    <option value="">Unassign</option>{locations.rows.filter(x=>x.state==="published").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
   </select></label>
   <div className="mt-3 flex flex-wrap gap-2"><button className={primary} disabled={action.busy} onClick={()=>void assign()}>Save assignment</button>
    <button className={secondary} onClick={()=>setSelected("")}>Cancel</button></div>
   <ActionResult state={action}/>
  </Card>}
 </div>;
}
export function Formats(){
 const formats=useRows<{placement:string;label:string;description:string}>("/public/formats");
 return <Card title="Supported ad placements">
  <FetchState state={formats}/>
  <div className="grid gap-3 sm:grid-cols-2">{formats.rows.map(f=><div key={f.placement} className="rounded-xl border border-indigo-100 p-4">
   <p className="font-bold">{f.label}</p><p className="mt-2 text-sm text-slate-600">{f.description}</p><p className="mt-2 text-xs text-slate-400">{f.placement}</p>
  </div>)}</div>
 </Card>;
}
export function Pricing(){
 const cities=useRows<City>("/admin/cities");
 const rates=useRows<Rate>("/pricing/rules");
 const taxes=useRows<Tax>("/admin/pricing/tax-policies");
 const action=useAction();
 const [cityId,setCityId]=React.useState(""),[placement,setPlacement]=React.useState(placements[0]??"bike_rear");
 const [amount,setAmount]=React.useState("10000"),[from,setFrom]=React.useState(""),[to,setTo]=React.useState("");
 const [active,setActive]=React.useState(false),[revision,setRevision]=React.useState<Rate|null>(null);
 const fields={ratePaisePerScreenDay:Number(amount),active,validFrom:from,validTo:to};
 function valid(){return Number.isInteger(Number(amount))&&Number(amount)>=0&&Number(amount)<=1000000000&&from.length===10&&to.length===10&&to>=from;}
 async function submit(e:React.FormEvent){
  e.preventDefault();if(!valid())return;
  const ok=revision?await action.mutate("/admin/pricing/rules/"+revision.id,"PUT",{expectedVersion:revision.version,...fields},"Rate revision saved."):
   await action.mutate("/admin/pricing/rules","POST",{cityId,placement,...fields},"Rate rule created.");
  if(ok){rates.refresh();setRevision(null);}
 }
 return <div className="space-y-5">
  <Alert type="warning">Amounts are INR paise per screen-day, not currency units. Actual quotation requires an approved tax policy and rate validity. Publishing tax policy must follow legal/tax review; no fictional default GST is inserted.</Alert>
  <Card title={revision?"Revise rate rule":"Create screen-day rate"}>
   <form className="grid max-w-2xl gap-4 sm:grid-cols-2" onSubmit={e=>void submit(e)}>
    {!revision&&<><label className={label}>City<select required className={line} value={cityId} onChange={e=>setCityId(e.target.value)}>
     <option value="">Select city</option>{cities.rows.filter(x=>x.state!=="archived").map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
    </select></label>
    <label className={label}>Placement<select className={line} value={placement} onChange={e=>setPlacement(e.target.value)}>
     {placements.map(x=><option key={x} value={x}>{x.replaceAll("_"," ")}</option>)}
    </select></label></>}
    <label className={label}>Rate in paise<input className={line} type="number" min={0} max={1000000000} step={1} required value={amount} onChange={e=>setAmount(e.target.value)}/></label>
    <label className={label}>Valid from<input className={line} type="date" required value={from} onChange={e=>setFrom(e.target.value)}/></label>
    <label className={label}>Valid to<input className={line} type="date" required value={to} onChange={e=>setTo(e.target.value)}/></label>
    <label className={label+" flex items-center gap-2"}><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/>Active rate</label>
    <div className="flex gap-2 sm:col-span-2">
     <button className={primary} type="submit" disabled={action.busy||!valid()||(!revision&&!cityId)}>Save rate</button>
     {revision&&<button className={secondary} type="button" onClick={()=>setRevision(null)}>Cancel edit</button>}
    </div>
   </form><ActionResult state={action}/>
  </Card>
  <Card title="Current pricing rules" tools={<button className={secondary} onClick={rates.refresh}>Refresh</button>}>
   <FetchState state={rates}/>
   <div className="divide-y divide-slate-100">{rates.rows.map(x=><div key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
    <div><p className="font-semibold">{x.placement} · {rupees(x.ratePaisePerScreenDay??0)}/screen-day</p>
     <p className="text-xs text-slate-500">v{x.version} · {x.validFrom} to {x.validTo}</p></div>
    <div className="flex items-center gap-2"><Tag value={x.active?"active":"inactive"}/>
     <button className={secondary} onClick={()=>{setRevision(x);setAmount(String(x.ratePaisePerScreenDay??0));setFrom(x.validFrom);setTo(x.validTo);setActive(x.active);}}>Revise</button>
    </div>
   </div>)}</div>
  </Card>
  <Card title="Tax policy versions">
   <FetchState state={taxes}/>
   <div className="divide-y divide-slate-100">{taxes.rows.map(x=><div key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
    <div><p className="font-semibold">{x.version} · {x.taxBps/100}%</p><p className="text-xs text-slate-500">{x.sourceReference}</p></div>
    <Tag value={x.active?"active":"inactive"}/>
   </div>)}</div>
   <Alert>Creating legally approved tax policy remains an explicit finance-governance operation; this screen does not assert tax registration or legal approval.</Alert>
  </Card>
 </div>;
}
