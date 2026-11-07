"use client";
import * as React from "react";
import {api,apiPage,newIdempotencyKey,ApiError} from "@/services/api-client";
import type {LiveSession} from "@/services/api-client";
import {Alert as UiAlert,Button,CursorPagination,Dialog,SkeletonList,StatusBadge,buttonVariants,type StatusTone} from "@/components/ui";
import {controlClass} from "@/components/ui/input";
import {cn} from "@/lib/utils";
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
export const line=cn(controlClass,"mt-1.5 block min-h-11 py-1.5 sm:min-h-10");
export const label="block text-sm font-semibold text-ink";
export const primary=buttonVariants({variant:"primary",size:"sm"})+" min-h-11 sm:min-h-10";
export const secondary=buttonVariants({variant:"outline",size:"sm"})+" min-h-11 sm:min-h-10";
const alertTone={info:"info",error:"danger",warning:"warning",success:"success"} as const;
/** Inline message on the design-system Alert. */
export function Alert({children,type="info"}:{children:React.ReactNode;type?:"info"|"error"|"warning"|"success"}){
 return <UiAlert tone={alertTone[type]}>{children}</UiAlert>;
}
/** A titled section of an admin page. */
export function Card({title,children,tools}:{title:string;children:React.ReactNode;tools?:React.ReactNode}){
 return <section className="rounded-lg border border-line bg-surface p-4">
  <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-heading text-base font-semibold text-ink">{title}</h2>{tools}</div>
  <div className="space-y-3">{children}</div>
 </section>;
}
const tones:Record<string,{label:string;tone:StatusTone}>={
 submitted:{label:"Submitted",tone:"info"},under_review:{label:"Under review",tone:"info"},pending:{label:"Pending",tone:"info"},
 approved:{label:"Approved",tone:"success"},verified:{label:"Verified",tone:"success"},active:{label:"Active",tone:"success"},
 rejected:{label:"Rejected",tone:"danger"},suspended:{label:"Suspended",tone:"danger"},scan_rejected:{label:"Scan failed",tone:"danger"},
 changes_requested:{label:"Changes requested",tone:"warning"},needs_review:{label:"Needs review",tone:"warning"},
 draft:{label:"Draft",tone:"neutral"},cancelled:{label:"Cancelled",tone:"neutral"},closed:{label:"Closed",tone:"neutral"},
 open:{label:"Open",tone:"info"},in_progress:{label:"In progress",tone:"info"},resolved:{label:"Resolved",tone:"success"},
 scan_clean:{label:"Scan clean",tone:"info"},uploaded:{label:"Uploaded",tone:"info"},pending_upload:{label:"Awaiting upload",tone:"neutral"},
 published:{label:"Published",tone:"success"},archived:{label:"Archived",tone:"neutral"},inactive:{label:"Inactive",tone:"neutral"},
 read:{label:"Read",tone:"neutral"},paid:{label:"Paid",tone:"success"},admin:{label:"Admin",tone:"neutral"},
 advertiser:{label:"Advertiser",tone:"neutral"},driver:{label:"Driver",tone:"neutral"},public:{label:"Public",tone:"neutral"},internal:{label:"Internal note",tone:"warning"},
};
/** A backend status or role as a plain-language badge. */
export function Tag({value}:{value:string|number|null|undefined}){
 const v=String(value??"unknown").toLowerCase();const t=tones[v];
 return <StatusBadge tone={t?.tone??"neutral"}>{t?.label??humanize(v)}</StatusBadge>;
}
/** camelCase or snake_case API key to a sentence-case label ("newUsers" -> "New users"). */
export function humanize(key:string){
 const words=key.replace(/Paise$/,"").replace(/([a-z])([A-Z])/g,"$1 $2").replaceAll("_"," ").trim().toLowerCase();
 return words.charAt(0).toUpperCase()+words.slice(1);
}
/** Dense admin table. Numeric columns are right-aligned with tabular numerals. */
export type Col<T>={key:string;header:string;cell:(row:T)=>React.ReactNode;numeric?:boolean;className?:string};
export function Table<T>({caption,rows,cols,rowKey,activeKey,onRowFocus}:{caption:string;rows:T[];cols:Col<T>[];rowKey:(r:T)=>string;activeKey?:string|null;onRowFocus?:(r:T)=>void}){
 if(!rows.length)return null;
 return <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto rounded-md border border-line focus-visible:outline-2 focus-visible:outline-signal">
  <table className="w-full border-collapse text-left text-sm">
   <caption className="sr-only">{caption}</caption>
   <thead className="bg-paper text-ink-muted"><tr>{cols.map(c=><th key={c.key} scope="col" className={cn("border-b border-line px-3 py-2 font-semibold whitespace-nowrap",c.numeric&&"text-right",c.className)}>{c.header}</th>)}</tr></thead>
   <tbody>{rows.map(r=>{const k=rowKey(r);const active=activeKey===k;return <tr key={k} aria-selected={activeKey!==undefined?active:undefined} onClick={onRowFocus?()=>onRowFocus(r):undefined} tabIndex={onRowFocus?0:undefined}
    onKeyDown={onRowFocus?e=>{if(e.target===e.currentTarget&&(e.key==="Enter"||e.key===" ")){e.preventDefault();onRowFocus(r);}}:undefined}
    className={cn("border-b border-line last:border-0",active&&"bg-signal-soft",onRowFocus&&"cursor-pointer hover:bg-paper")}>
    {cols.map(c=><td key={c.key} data-numeric={c.numeric?"":undefined} className={cn("px-3 py-2 align-middle text-ink",c.numeric&&"text-right whitespace-nowrap",c.className)}>{c.cell(r)}</td>)}
   </tr>;})}</tbody>
  </table>
 </div>;
}
/** Confirmation step before an irreversible or audited admin action. */
export function Confirm({open,onOpenChange,title,description,confirmLabel,destructive,busy,onConfirm,children}:{open:boolean;onOpenChange:(v:boolean)=>void;title:string;description?:string;confirmLabel:string;destructive?:boolean;busy?:boolean;onConfirm:()=>void;children?:React.ReactNode}){
 return <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}
  footer={<><Button variant="ghost" onClick={()=>onOpenChange(false)}>Cancel</Button><Button variant={destructive?"destructive":"primary"} loading={busy} onClick={onConfirm}>{confirmLabel}</Button></>}>
  {children??<p className="text-sm text-ink-muted">This is recorded in the audit log.</p>}
 </Dialog>;
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
 return {rows:ready?state.rows:[] as T[],next:ready?state.next:null,hasPrevious:!!cursor,
  loading:!!path&&!ready,error:ready?state.error:"",
  refresh:()=>setVersion(x=>x+1),first:()=>setOffset({path,cursor:null}),
  more:()=>{if(ready&&state.next)setOffset({path,cursor:state.next});}};
}
export function Pager({state}:{state:{next:string|null;loading:boolean;hasPrevious:boolean;first:()=>void;more:()=>void}}){
 return <CursorPagination busy={state.loading} hasNext={!!state.next} hasPrevious={state.hasPrevious} onFirst={state.first} onNext={state.more}/>;
}
export function FetchState({state,empty="No matching records."}:{state:{loading:boolean;error:string;rows:unknown[]};empty?:string}){
 return <>{state.loading&&<SkeletonList rows={2} label="Loading"/>}
  {state.error&&<Alert type="error">{state.error}</Alert>}
  {!state.loading&&!state.error&&!state.rows.length&&<p className="rounded-md border border-dashed border-line bg-paper p-4 text-sm text-ink-muted">{empty}</p>}</>;
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
