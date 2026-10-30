"use client";
import * as React from "react";
import {apiPage,ApiError} from "@/services/api-client";
import type {LiveSession} from "@/services/api-client";
export type Business={id:string;slug:string;displayName:string;city:string|null;legalName:string|null;verificationStatus:string};
export type Creative={id:string;ownerBusinessId:string;title:string;placement:string;mediaAssetId:string;approval:string;reviewReason:string|null;createdAt:string};
export type Campaign={id:string;ownerBusinessId:string;title:string;creativeId:string;startDate:string;endDate:string;weekdays:number[];timeWindow:{start:string;end:string};status:string;revision:number;reviewReason:string|null;createdAt:string;updatedAt:string};
export type ScreenFormat={placement:string;label:string;description:string};
export type Site={id:string;name:string;city:string;citySlug:string;zone:string;lat:number;lng:number};
export type Quote={id:string;campaignId:string;businessId:string;totalPaise:string;taxPaise:string;currency:string;expiresAt:string;reservationStatus:string;screenIds:string[]};
export type Payment={id:string;orderId:string;amountPaise:number;state?:string;status?:string;createdAt?:string};
export type AuthContext={session:LiveSession;business:Business|null;businesses:Business[];reloadBusinesses:()=>Promise<void>;refreshSession:()=>Promise<void>};
export const Auth=React.createContext<AuthContext|null>(null);
export function useAuth(){const value=React.useContext(Auth);if(!value)throw new Error("Authenticated advertiser context required");return value;}
export function message(e:unknown){return e instanceof ApiError?e.message:e instanceof Error?e.message:"The request could not be completed";}
export const money=(raw:unknown)=>{
 try{const amount=BigInt(String(raw??0));const abs=amount<BigInt(0)?-amount:amount;
 return (amount<BigInt(0)?"-":"")+"₹"+(abs/BigInt(100)).toLocaleString("en-IN")+"."+(abs%BigInt(100)).toString().padStart(2,"0");}
 catch{return "Unavailable";}
};
export function useCollection<T>(path:string|null){
 const [page,setPage]=React.useState<{path:string|null;cursor:string|null}>({path:null,cursor:null});
 const [version,setVersion]=React.useState(0);
 const cursor=page.path===path?page.cursor:null;
 const key=String(path)+"|"+String(cursor)+"|"+version;
 const [response,setResponse]=React.useState<{key:string;rows:T[];next:string|null;error:string}>({
  key:"",rows:[],next:null,error:""
 });
 React.useEffect(()=>{
  if(!path)return;
  let active=true;
  const controller=new AbortController();
  const url=path+(cursor?(path.includes("?")?"&":"?")+"cursor="+encodeURIComponent(cursor):"");
  void apiPage<T>(url,controller.signal)
   .then(data=>{if(active)setResponse({key,rows:data.data,next:data.meta.nextCursor??null,error:""});})
   .catch(e=>{if(active)setResponse({key,rows:[],next:null,error:message(e)});});
  return ()=>{active=false;controller.abort();};
 },[path,cursor,version,key]);
 const ready=!!path&&response.key===key;
 return {rows:ready?response.rows:[] as T[],next:ready?response.next:null,
  busy:!!path&&!ready,error:ready?response.error:"",
  refresh:()=>setVersion(v=>v+1),
  first:()=>setPage({path,cursor:null}),
  more:()=>{if(ready&&response.next)setPage({path,cursor:response.next});}};
}
export function Notice({children,kind="info"}:{children:React.ReactNode;kind?:"info"|"warning"|"error"|"success"}){
 const style=kind==="error"?"border-red-200 bg-red-50 text-red-900":kind==="warning"?"border-amber-200 bg-amber-50 text-amber-950":kind==="success"?"border-emerald-200 bg-emerald-50 text-emerald-900":"border-blue-200 bg-blue-50 text-blue-950";
 return <div role={kind==="error"?"alert":"status"} className={"rounded-xl border p-4 text-sm leading-6 "+style}>{children}</div>;
}
export function Panel({title,children,action}:{title:string;children:React.ReactNode;action?:React.ReactNode}){
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold text-[#103459]">{title}</h2>{action}</div>{children}
 </section>;
}
export const field="mt-1 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100";
export const primary="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1768d3] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0e4f9f] disabled:cursor-not-allowed disabled:opacity-50";
export const secondary="inline-flex min-h-10 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-[#10539a] hover:bg-blue-50 disabled:opacity-50";
export const label="block text-sm font-semibold text-slate-700";
export function Pagination({busy,next,more,first}:{busy:boolean;next:string|null;more:()=>void;first:()=>void}){
 return <div className="mt-4 flex gap-3">
  <button type="button" className={secondary} onClick={first} disabled={busy}>First page</button>
  {next&&<button type="button" className={secondary} onClick={more} disabled={busy}>Next page</button>}
 </div>;
}
export function CollectionNotice({busy,error,length}:{busy:boolean;error:string;length:number}){
 return <>{error&&<Notice kind="error">{error}</Notice>}{busy&&<p role="status" className="text-sm text-slate-500">Loading records from AdVibe API…</p>}
 {!busy&&!error&&length===0&&<Notice>No records found for this account.</Notice>}</>;
}
export const formatDate=(s:string|undefined)=>s?new Date(s).toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}):"—";
