"use client";
// Exact-text checks in tests/b4-admin-live-contract.test.mjs: keep the catalog routes and
// expectedVersion:revision.version below as written.
import * as React from "react";
import {api,Card,Alert,Tag,Table,Confirm,FetchState,Pager,ActionResult,useRows,useAction,humanize,line,label,primary,secondary,date,rupees,explain} from "./common";
type City={id:string;name:string;slug:string;countryCode:string;timeZone:string;state:string};
type Zone={id:string;cityId:string;name:string;slug:string;centerLat:number;centerLng:number;radiusMeters:number;state:string};
type Site={id:string;zoneId:string;name:string;slug:string;lat:number;lng:number;state:string};
type Rate={id:string;cityId:string;placement:string;version:number;ratePaisePerScreenDay:number|null;active:boolean;validFrom:string;validTo:string};
type Tax={id:string;version:string;taxBps:number;active:boolean;validFrom:string;validTo:string;sourceReference:string};
type Screen={id:string;vehicleId:string;placement:string;state:string;locationId?:string|null};
type Kind="city"|"zone"|"location";
const placements=["bike_rear","auto_rear","auto_side","car_rear","car_interior","helmet"];
const kindLabel:Record<Kind,string>={city:"City",zone:"Zone",location:"Location"};
function selectState(current:string){
 if(current==="draft")return "published";
 if(current==="published")return "archived";
 return null;
}
const stateAction:Record<string,string>={published:"Publish",archived:"Archive"};
export function Geo(){
 const cities=useRows<City>("/admin/cities"),zones=useRows<Zone>("/admin/zones"),sites=useRows<Site>("/admin/locations?limit=100");
 const action=useAction();
 const [tab,setTab]=React.useState<Kind>("city");
 const [name,setName]=React.useState(""),[slug,setSlug]=React.useState("");
 const [cityId,setCityId]=React.useState(""),[zoneId,setZoneId]=React.useState("");
 const [country,setCountry]=React.useState("IN"),[timeZone,setTimeZone]=React.useState("Asia/Kolkata");
 const [lat,setLat]=React.useState(""),[lng,setLng]=React.useState(""),[radius,setRadius]=React.useState("2000");
 const [pending,setPending]=React.useState<{kind:Kind;id:string;name:string;current:string}|null>(null);
 const refresh=()=>{cities.refresh();zones.refresh();sites.refresh();};
 async function create(e:React.FormEvent){
  e.preventDefault();if(!name.trim()||!slug.trim())return;
  const body=tab==="city"?{name:name.trim(),slug:slug.trim(),countryCode:country.toUpperCase(),timeZone}:
   tab==="zone"?{cityId,name:name.trim(),slug:slug.trim(),centerLat:Number(lat),centerLng:Number(lng),radiusMeters:Number(radius)}:
    {zoneId,name:name.trim(),slug:slug.trim(),lat:Number(lat),lng:Number(lng)};
  if(tab!=="city"&&(!lat.trim()||!lng.trim()))return;
  const endpoint="/admin/"+(tab==="city"?"cities":tab==="zone"?"zones":"locations");
  const ok=await action.mutate(endpoint,"POST",body,kindLabel[tab]+" saved as an unpublished draft.");
  if(ok){setName("");setSlug("");refresh();}
 }
 async function transition(){
  if(!pending)return;
  const next=selectState(pending.current);
  if(!next){setPending(null);return;}
  const endpoint=pending.kind==="city"?"cities":pending.kind==="zone"?"zones":"locations";
  const ok=await action.mutate("/admin/"+endpoint+"/"+pending.id,"PATCH",{state:next},kindLabel[pending.kind]+" "+next+".");
  setPending(null);
  if(ok)refresh();
 }
 const stateCell=(kind:Kind,x:{id:string;name:string;state:string})=>{const next=selectState(x.state);
  return next?<button className={secondary} disabled={action.busy} onClick={()=>setPending({kind,id:x.id,name:x.name,current:x.state})}>{stateAction[next]}</button>:null;};
 const next=pending?selectState(pending.current):null;
 return <div className="space-y-4">
  <Alert>New cities, zones and locations start as unpublished drafts. Advertisers only see published ones. The server checks boundaries and that the parent is published.</Alert>
  <Card title="Add a city, zone or location">
   <div role="group" aria-label="What to add" className="flex flex-wrap gap-2">{(["city","zone","location"] as const).map(k=>
    <button key={k} aria-pressed={tab===k} className={tab===k?primary:secondary} onClick={()=>setTab(k)}>{kindLabel[k]}</button>)}</div>
   <form onSubmit={e=>void create(e)} className="grid max-w-3xl gap-4 sm:grid-cols-2">
    <label className={label}>Name<input className={line} required maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></label>
    <label className={label}>URL slug<input className={line} required pattern="[a-z0-9]+(-[a-z0-9]+)*" minLength={2} maxLength={100} placeholder="e.g. south-delhi"
     value={slug} onChange={e=>setSlug(e.target.value.toLowerCase())}/></label>
    {tab==="city"?<>
     <label className={label}>Country code (2 letters)<input className={line} required pattern="[A-Z]{2}" maxLength={2} value={country} onChange={e=>setCountry(e.target.value.toUpperCase())}/></label>
     <label className={label}>Time zone<input className={line} required value={timeZone} onChange={e=>setTimeZone(e.target.value)}/></label>
    </>:<>
     <label className={label}>{tab==="zone"?"City":"Zone"}<select required className={line} value={tab==="zone"?cityId:zoneId}
      onChange={e=>tab==="zone"?setCityId(e.target.value):setZoneId(e.target.value)}>
      <option value="">Choose one</option>{tab==="zone"?cities.rows.filter(x=>x.state!=="archived").map(x=><option key={x.id} value={x.id}>{x.name}</option>):
       zones.rows.filter(x=>x.state!=="archived").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
     </select></label>
     <label className={label}>Latitude<input type="number" step="any" min={-90} max={90} required className={line} value={lat} onChange={e=>setLat(e.target.value)}/></label>
     <label className={label}>Longitude<input type="number" step="any" min={-180} max={180} required className={line} value={lng} onChange={e=>setLng(e.target.value)}/></label>
     {tab==="zone"&&<label className={label}>Radius (metres)<input type="number" min={100} max={50000} step={1} className={line} value={radius} onChange={e=>setRadius(e.target.value)}/></label>}
    </>}
    <div className="sm:col-span-2"><button disabled={action.busy} className={primary}>Save as draft</button></div>
   </form>
   <ActionResult state={action}/>
  </Card>
  <Card title="Cities" tools={<button className={secondary} onClick={refresh}>Refresh all</button>}>
   <FetchState state={cities} empty="No cities yet."/>
   <Table caption="Cities" rows={cities.rows} rowKey={x=>x.id} cols={[
    {key:"n",header:"City",cell:x=><span className="font-medium">{x.name}</span>},
    {key:"s",header:"Slug",cell:x=><span className="font-mono text-xs">{x.slug}</span>},
    {key:"t",header:"Time zone",cell:x=>x.timeZone},
    {key:"st",header:"Status",cell:x=><Tag value={x.state}/>},
    {key:"a",header:"",cell:x=>stateCell("city",x)},
   ]}/>
  </Card>
  <Card title="Zones"><FetchState state={zones} empty="No zones yet."/>
   <Table caption="Zones" rows={zones.rows} rowKey={x=>x.id} cols={[
    {key:"n",header:"Zone",cell:x=><span className="font-medium">{x.name}</span>},
    {key:"c",header:"City",cell:x=>cities.rows.find(c=>c.id===x.cityId)?.name??"—"},
    {key:"r",header:"Radius (m)",numeric:true,cell:x=>x.radiusMeters.toLocaleString("en-IN")},
    {key:"st",header:"Status",cell:x=><Tag value={x.state}/>},
    {key:"a",header:"",cell:x=>stateCell("zone",x)},
   ]}/>
  </Card>
  <Card title="Locations"><FetchState state={sites} empty="No locations yet."/>
   <Table caption="Locations" rows={sites.rows} rowKey={x=>x.id} cols={[
    {key:"n",header:"Location",cell:x=><span className="font-medium">{x.name}</span>},
    {key:"z",header:"Zone",cell:x=>zones.rows.find(z=>z.id===x.zoneId)?.name??"—"},
    {key:"p",header:"Coordinates",numeric:true,cell:x=>x.lat+", "+x.lng},
    {key:"st",header:"Status",cell:x=><Tag value={x.state}/>},
    {key:"a",header:"",cell:x=>stateCell("location",x)},
   ]}/>
   <Pager state={sites}/>
  </Card>
  <Confirm open={!!pending} onOpenChange={v=>{if(!v)setPending(null);}} busy={action.busy} destructive={next==="archived"}
   title={pending&&next?stateAction[next]+" "+pending.name+"?":""}
   description={next==="archived"?"Advertisers will no longer be able to choose it for new campaigns.":"Advertisers will be able to choose it for campaigns."}
   confirmLabel={next?stateAction[next]:"Confirm"} onConfirm={()=>void transition()}/>
 </div>;
}
type PlayerStatus={screenId:string;lastHeartbeatAt:string|null;status:string};
export function Screens(){
 const screens=useRows<Screen>("/screens?limit=100");
 const locations=useRows<Site>("/admin/locations?limit=100");
 const [selected,setSelected]=React.useState(""),[location,setLocation]=React.useState("");
 const [view,setView]=React.useState<PlayerStatus|null>(null);
 const [error,setError]=React.useState("");
 const action=useAction();
 async function assign(){
  if(!selected)return;
  const ok=await action.mutate("/admin/screens/"+selected+"/location","PUT",
   {locationId:location||null},"Screen location updated.");
  if(ok){screens.refresh();setSelected("");}
 }
 async function inspect(id:string){
  setError("");setView(null);
  try{setView(await api<PlayerStatus>("/admin/devices/"+id+"/player-status"));}
  catch(e){setError(explain(e));}
 }
 const locationName=(id?:string|null)=>id?locations.rows.find(l=>l.id===id)?.name??"Assigned":"Not assigned";
 return <div className="space-y-4">
  <Alert type="warning">Pairing screens, device keys and playback are handled outside the portal. This page doesn&apos;t issue pairing credentials.</Alert>
  <Card title="Registered screens" tools={<button className={secondary} onClick={screens.refresh}>Refresh</button>}>
   <FetchState state={screens} empty="No screens registered yet."/>
   <ActionResult state={selected?{error:"",success:""}:action}/>
   <Table caption="Registered screens" rows={screens.rows} rowKey={s=>s.id} activeKey={selected||undefined} cols={[
    {key:"p",header:"Placement",cell:s=><span className="font-medium">{humanize(s.placement)}</span>},
    {key:"i",header:"Screen ID",cell:s=><span className="font-mono text-xs break-all text-ink-muted">{s.id}</span>},
    {key:"l",header:"Location",cell:s=>locationName(s.locationId)},
    {key:"s",header:"Status",cell:s=><Tag value={s.state}/>},
    {key:"a",header:"",cell:s=><div className="flex justify-end gap-2">
     <button className={secondary} onClick={()=>{setSelected(s.id);setLocation(s.locationId??"");action.clear();}}>Assign location</button>
     <button className={secondary} onClick={()=>void inspect(s.id)}>Player status</button>
    </div>},
   ]}/>
   {view&&<Alert>Screen {view.screenId}: {humanize(view.status)}. Last check-in: {view.lastHeartbeatAt?date(view.lastHeartbeatAt):"not recorded"}.</Alert>}
   {error&&<Alert type="error">{error}</Alert>}
  </Card>
  {selected&&<Card title="Change screen location">
   <label className={label+" max-w-md"}>Published location<select className={line} value={location} onChange={e=>setLocation(e.target.value)}>
    <option value="">No location</option>{locations.rows.filter(x=>x.state==="published").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
   </select></label>
   <div className="flex flex-wrap gap-2"><button className={primary} disabled={action.busy} onClick={()=>void assign()}>Save location</button>
    <button className={secondary} onClick={()=>setSelected("")}>Cancel</button></div>
   <ActionResult state={action}/>
  </Card>}
 </div>;
}
export function Formats(){
 const formats=useRows<{placement:string;label:string;description:string}>("/public/formats");
 return <Card title="Ad formats">
  <FetchState state={formats} empty="No formats published."/>
  <Table caption="Ad formats" rows={formats.rows} rowKey={f=>f.placement} cols={[
   {key:"l",header:"Format",cell:f=><span className="font-medium">{f.label}</span>},
   {key:"d",header:"Description",cell:f=><span className="text-ink-muted">{f.description}</span>},
   {key:"k",header:"Code",cell:f=><span className="font-mono text-xs">{f.placement}</span>},
  ]}/>
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
 const [confirming,setConfirming]=React.useState(false);
 const fields={ratePaisePerScreenDay:Number(amount),active,validFrom:from,validTo:to};
 function valid(){return Number.isInteger(Number(amount))&&Number(amount)>=0&&Number(amount)<=1000000000&&from.length===10&&to.length===10&&to>=from;}
 async function submit(){
  if(!valid())return;
  const ok=revision?await action.mutate("/admin/pricing/rules/"+revision.id,"PUT",{expectedVersion:revision.version,...fields},"Rate updated."):
   await action.mutate("/admin/pricing/rules","POST",{cityId,placement,...fields},"Rate created.");
  setConfirming(false);
  if(ok){rates.refresh();setRevision(null);}
 }
 const cityName=(id:string)=>cities.rows.find(c=>c.id===id)?.name??"—";
 return <div className="space-y-4">
  <Alert type="warning">Rates are entered in paise per screen per day (10000 paise = ₹100). A quote also needs an approved tax policy. No default GST rate is assumed.</Alert>
  <Card title={revision?"Change rate: "+humanize(revision.placement)+", "+cityName(revision.cityId):"New screen-day rate"}>
   <form className="grid max-w-2xl gap-4 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();if(valid())setConfirming(true);}}>
    {!revision&&<><label className={label}>City<select required className={line} value={cityId} onChange={e=>setCityId(e.target.value)}>
     <option value="">Choose a city</option>{cities.rows.filter(x=>x.state!=="archived").map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
    </select></label>
    <label className={label}>Placement<select className={line} value={placement} onChange={e=>setPlacement(e.target.value)}>
     {placements.map(x=><option key={x} value={x}>{humanize(x)}</option>)}
    </select></label></>}
    <label className={label}>Rate in paise<input className={line} type="number" min={0} max={1000000000} step={1} required value={amount} onChange={e=>setAmount(e.target.value)}/>
     <span className="mt-1 block text-xs font-normal text-ink-muted tabular-nums">{rupees(Number.isInteger(Number(amount))?amount:0)} per screen per day</span></label>
    <label className={label}>Valid from<input className={line} type="date" required value={from} onChange={e=>setFrom(e.target.value)}/></label>
    <label className={label}>Valid to<input className={line} type="date" required value={to} onChange={e=>setTo(e.target.value)}/></label>
    <label className={label+" flex items-center gap-2 self-end"}><input type="checkbox" className="size-4" checked={active} onChange={e=>setActive(e.target.checked)}/>Active rate</label>
    <div className="flex gap-2 sm:col-span-2">
     <button className={primary} type="submit" disabled={action.busy||!valid()||(!revision&&!cityId)}>Save rate</button>
     {revision&&<button className={secondary} type="button" onClick={()=>setRevision(null)}>Cancel</button>}
    </div>
   </form><ActionResult state={action}/>
  </Card>
  <Card title="Rates" tools={<button className={secondary} onClick={rates.refresh}>Refresh</button>}>
   <FetchState state={rates} empty="No rates yet."/>
   <Table caption="Screen-day rates" rows={rates.rows} rowKey={x=>x.id} activeKey={revision?.id} cols={[
    {key:"p",header:"Placement",cell:x=><span className="font-medium">{humanize(x.placement)}</span>},
    {key:"c",header:"City",cell:x=>cityName(x.cityId)},
    {key:"v",header:"Valid",cell:x=><span className="whitespace-nowrap tabular-nums">{x.validFrom} to {x.validTo}</span>},
    {key:"ver",header:"Version",numeric:true,cell:x=>x.version},
    {key:"r",header:"Per screen-day",numeric:true,cell:x=>rupees(x.ratePaisePerScreenDay??0)},
    {key:"s",header:"Status",cell:x=><Tag value={x.active?"active":"inactive"}/>},
    {key:"a",header:"",cell:x=><button className={secondary} onClick={()=>{setRevision(x);setAmount(String(x.ratePaisePerScreenDay??0));setFrom(x.validFrom);setTo(x.validTo);setActive(x.active);action.clear();}}>Change</button>},
   ]}/>
  </Card>
  <Card title="Tax policies">
   <FetchState state={taxes} empty="No tax policies recorded."/>
   <Table caption="Tax policies" rows={taxes.rows} rowKey={x=>x.id} cols={[
    {key:"v",header:"Version",cell:x=><span className="font-medium">{x.version}</span>},
    {key:"s",header:"Source",cell:x=><span className="text-ink-muted">{x.sourceReference}</span>},
    {key:"r",header:"Rate",numeric:true,cell:x=>(x.taxBps/100).toFixed(2)+"%"},
    {key:"st",header:"Status",cell:x=><Tag value={x.active?"active":"inactive"}/>},
   ]}/>
   <p className="text-sm text-ink-muted">Tax policies are added by finance after legal review. This page doesn&apos;t confirm tax registration or legal approval.</p>
  </Card>
  <Confirm open={confirming} onOpenChange={setConfirming} busy={action.busy}
   title={revision?"Save the changed rate?":"Create this rate?"}
   description={active?"An active rate is used for new quotes straight away.":"The rate is saved as inactive and isn't used for quotes."}
   confirmLabel="Save rate" onConfirm={()=>void submit()}>
   <p className="text-sm text-ink tabular-nums">{rupees(amount)} per screen per day, {from} to {to}.</p>
  </Confirm>
 </div>;
}
