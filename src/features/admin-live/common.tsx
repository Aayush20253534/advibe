"use client";
import * as React from "react";
import {api,apiPage,newIdempotencyKey,ApiError} from "@/services/api-client";
import type {LiveSession} from "@/services/api-client";
export {api,newIdempotencyKey};
export type User={id:string;displayName:string;email:string;role:string;status:string;verified:boolean;createdAt:string};
export type Campaign={id:string;title:string;ownerBusinessId:string;creativeId:string;status:string;revision:number;submissionNumber:number;startDate:string;endDate:string;reviewReason:string|null};
export type Creative={id:string;title:string;ownerBusinessId:string;approval:string;placement:string;mediaAssetId:string;reviewReason:string|null};
export type Application={id:string;state:string;completedStep:number;submittedAt:string|null};
export type AppDetail=Application&{driverUserId:string;vehicleId:string|null;documents:Array<{id:string;kind:string;status:string;uploadedAt:string|null}>;agreements:Array<{templateVersion:string;acceptedAt:string}>;reviews:Array<{decision:string;reason:string;createdAt:string}>};
export type Ticket={id:string;subject:string;description:string;category:string;status:string;version:number;assignedToUserId:string|null;createdAt:string};
export type Screen={id:string;vehicleId:string;placement:string;state:string;locationId?:string|null};
export type Reports={period:{from:string;to:string;timezone:string};definition:string;counts:Record<string,number>;financial:Record<string,string>};
export type AdminContext={session:LiveSession};
export const AdminContext=React.createContext<AdminContext|null>(null);
export function useAdmin(){const ctx=React.useContext(AdminContext);if(!ctx)throw Error("Admin session required");return ctx;}
export const line="mt-1 block w-full min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
export const label="block text-sm font-semibold text-slate-700";
export const primary="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#4f28d4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3d16ad] disabled:cursor-not-allowed disabled:opacity-50";
export const secondary="inline-flex min-h-10 items-center justify-center rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 disabled:opacity-50";
export function Alert({children,type="info"}:{children:React.ReactNode;type?:"info"|"error"|"warning"|"success"}){
 const cls=type==="error"?"border-red-200 bg-red-50 text-red-900":type==="warning"?"border-amber-200 bg-amber-50 text-amber-950":type==="success"?"border-emerald-200 bg-emerald-50 text-emerald-950":"border-indigo-100 bg-indigo-50 text-indigo-950";
 return <div role={type==="error"?"alert":"status"} className={"rounded-xl border p-4 text-sm leading-6 "+cls}>{children}</div>;
}
export function Card({title,children,tools}:{title:string;children:React.ReactNode;tools?:React.ReactNode}){
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold text-[#132951]">{title}</h2>{tools}</div>{children}
 </section>;
}
export function Tag({value}:{value:string|number|null|undefined}){
 return <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-900">{String(value??"unknown").replaceAll("_"," ")}</span>;
}
export function explain(e:unknown){
 return e instanceof ApiError?e.message:e instanceof Error?e.message:"Backend request failed";
}
/** Guard GET page identity so records from a different filter never flash on screen. */
export function useRows<T>(path:string|null){
 const [offset,setOffset]=React.useState<{path:string|null;cursor:string|null}>({path:null,cursor:null});
 const [version,setVersion]=React.useState(0);
 const cursor=offset.path===path?offset.cursor:null;
 const key=[path,cursor,version].join("|");
 const [state,setState]=React.useState<{key:string;rows:T[];next:string|null;error:string}>({key:"",rows:[],next:null,error:""});
 React.useEffect(()=>{
  if(!path)return;
  const controller=new AbortController();
  const suffix=cursor?(path.includes("?")?"&":"?")+"cursor="+encodeURIComponent(cursor):"";
  void apiPage<T>(path+suffix,controller.signal).then(x=>{
   if(!controller.signal.aborted)setState({key,rows:x.data,next:x.meta.nextCursor??null,error:""});
  }).catch(e=>{if(!controller.signal.aborted)setState({key,rows:[],next:null,error:explain(e)});});
  return ()=>controller.abort();
 },[path,cursor,version,key]);
 const ready=!!path&&state.key===key;
 return {rows:ready?state.rows:[] as T[],next:ready?state.next:null,
  loading:!!path&&!ready,error:ready?state.error:"",
  refresh:()=>setVersion(x=>x+1),first:()=>setOffset({path,cursor:null}),
  more:()=>{if(ready&&state.next)setOffset({path,cursor:state.next});}};
}
export function Pager({state}:{state:{next:string|null;loading:boolean;first:()=>void;more:()=>void}}){
 return <div className="mt-4 flex gap-2">
  <button type="button" className={secondary} disabled={state.loading} onClick={state.first}>First page</button>
  {state.next&&<button type="button" className={secondary} disabled={state.loading} onClick={state.more}>Next page</button>}
 </div>;
}
export function FetchState({state}:{state:{loading:boolean;error:string;rows:unknown[]}}){
 return <>{state.loading&&<p role="status" className="text-sm text-slate-500">Loading from the Admin API…</p>}
  {state.error&&<Alert type="error">{state.error}</Alert>}
  {!state.loading&&!state.error&&!state.rows.length&&<Alert>No matching records.</Alert>}</>;
}
export function useAction(){
 const {session}=useAdmin();
 const [busy,setBusy]=React.useState(false),[error,setError]=React.useState(""),[success,setSuccess]=React.useState("");
 async function mutate(path:string,method:"POST"|"PATCH"|"PUT",body:unknown,successMessage:string){
  if(busy)return false;
  setBusy(true);setError("");setSuccess("");
  try{await api(path,{method,body,csrfToken:session.csrfToken,idempotencyKey:newIdempotencyKey()});
   setSuccess(successMessage);return true;
  }catch(e){setError(explain(e));return false;}
  finally{setBusy(false);}
 }
 return {busy,error,success,mutate,clear:()=>{setError("");setSuccess("");}};
}
export function ActionResult({state}:{state:{error:string;success:string}}){
 return <>{state.error&&<Alert type="error">{state.error}</Alert>}{state.success&&<Alert type="success">{state.success}</Alert>}</>;
}
export function date(s:string|null|undefined){return s?new Date(s).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"—";}
export function rupees(v:string|number|undefined){
 try{const n=BigInt(String(v??"0"));const abs=n<BigInt(0)?-n:n;
 return (n<BigInt(0)?"-":"")+"₹"+(abs/BigInt(100)).toLocaleString("en-IN")+"."+(abs%BigInt(100)).toString().padStart(2,"0");
 }catch{return "Unavailable";}
}
