"use client";
import * as React from "react";
import {apiPage,ApiError} from "@/services/api-client";
import type {LiveSession} from "@/services/api-client";
import {Alert,CursorPagination,buttonVariants,SkeletonList,StatusBadge,type StatusTone} from "@/components/ui";
import {controlClass} from "@/components/ui/input";
import {cn} from "@/lib/utils";
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
 return {rows:ready?response.rows:[] as T[],next:ready?response.next:null,hasPrevious:!!cursor,
  busy:!!path&&!ready,error:ready?response.error:"",
  refresh:()=>setVersion(v=>v+1),
  first:()=>setPage({path,cursor:null}),
  more:()=>{if(ready&&response.next)setPage({path,cursor:response.next});}};
}
const noticeTone={info:"info",warning:"warning",error:"danger",success:"success"} as const;
/** Inline message on the design-system Alert. Errors are announced immediately. */
export function Notice({children,kind="info"}:{children:React.ReactNode;kind?:"info"|"warning"|"error"|"success"}){
 return <Alert tone={noticeTone[kind]}>{children}</Alert>;
}
/** A titled section of a page. */
export function Panel({title,children,action,description}:{title:string;children:React.ReactNode;action?:React.ReactNode;description?:React.ReactNode}){
 return <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
   <div className="min-w-0"><h2 className="font-heading text-lg font-semibold text-ink">{title}</h2>
    {description?<p className="mt-1 text-sm text-ink-muted">{description}</p>:null}</div>
   {action}
  </div>
  <div className="space-y-4">{children}</div>
 </section>;
}
export const field=cn(controlClass,"mt-1.5 block min-h-11 py-2");
export const primary=buttonVariants({variant:"primary"});
export const secondary=buttonVariants({variant:"outline"});
export const label="block text-sm font-semibold text-ink";
export function Pagination({busy,next,hasPrevious,more,first}:{busy:boolean;next:string|null;hasPrevious:boolean;more:()=>void;first:()=>void}){
 return <CursorPagination busy={busy} hasPrevious={hasPrevious} hasNext={!!next} onFirst={first} onNext={more}/>;
}
/** Loading, error and empty states for a fetched list. */
export function CollectionNotice({busy,error,length,empty="Nothing here yet."}:{busy:boolean;error:string;length:number;empty?:React.ReactNode}){
 return <>{error&&<Notice kind="error">{error}</Notice>}
  {busy&&<SkeletonList rows={2} label="Loading"/>}
  {!busy&&!error&&length===0&&<p className="rounded-lg border border-dashed border-line bg-paper p-5 text-sm text-ink-muted">{empty}</p>}</>;
}
const statusLabels:Record<string,{label:string;tone:StatusTone}>={
 draft:{label:"Draft",tone:"neutral"},submitted:{label:"In review",tone:"info"},
 changes_requested:{label:"Changes requested",tone:"warning"},approved:{label:"Approved",tone:"success"},
 rejected:{label:"Rejected",tone:"danger"},cancelled:{label:"Cancelled",tone:"neutral"},
 pending:{label:"In review",tone:"info"},pending_review:{label:"In review",tone:"info"},
 ready:{label:"Ready",tone:"success"},processing:{label:"Processing",tone:"info"},uploaded:{label:"Uploaded",tone:"info"},
 failed:{label:"Failed",tone:"danger"},verified:{label:"Verified",tone:"success"},unverified:{label:"Not verified",tone:"neutral"},
 read:{label:"Read",tone:"neutral"},open:{label:"Open",tone:"info"},closed:{label:"Closed",tone:"neutral"},resolved:{label:"Resolved",tone:"success"},
 paid:{label:"Paid",tone:"success"},
};
/** A backend status as a plain-language badge (falls back to a readable version of the raw value). */
export function StatusTag({value:raw}:{value:string|null|undefined}){
 const value=raw?String(raw):"unknown";
 const known=statusLabels[value.toLowerCase()];
 const text=known?.label??(value.charAt(0).toUpperCase()+value.slice(1).toLowerCase()).replaceAll("_"," ");
 return <StatusBadge tone={known?.tone??"neutral"}>{text}</StatusBadge>;
}
export const formatDate=(s:string|undefined)=>s?new Date(s).toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}):"—";
