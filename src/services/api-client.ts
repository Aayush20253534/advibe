export type LiveRole="advertiser"|"driver"|"admin";
export type LiveSession={userId:string;role:LiveRole;expiresAt:string;csrfToken:string};
export class ApiError extends Error{
 constructor(public status:number,public code:string,message:string){super(message);this.name="ApiError";}
}
type Envelope<T>={data:T;meta?:{nextCursor?:string|null;unreadCount?:number}};
const base="/api/backend/";
function serviceUrl(path:string):string{
 if(!path.startsWith("/")||path.startsWith("//")||path.includes("..")||/[#\\]/.test(path))
  throw new ApiError(400,"INVALID_PATH","Invalid service path");
 return base+path.slice(1);
}
async function request(path:string,init:RequestInit={},signal?:AbortSignal):Promise<Response>{
 const url=serviceUrl(path);
 const timeout=AbortSignal.timeout(15000);
 try{
  return await fetch(url,{...init,credentials:"same-origin",cache:"no-store",
   signal:signal?AbortSignal.any([signal,timeout]):timeout});
 }catch(e){
  if(signal?.aborted)throw e;
  throw new ApiError(503,timeout.aborted?"REQUEST_TIMEOUT":"NETWORK_UNAVAILABLE",
   timeout.aborted?"The service took too long to respond. Try again.":"Could not connect to BlinkMyAd. Try again.");
 }
}
async function envelope<T>(response:Response):Promise<Envelope<T>>{
 let payload:unknown;
 try{payload=await response.json();}catch{
  throw new ApiError(response.ok?502:response.status,"INVALID_RESPONSE","The service returned an unreadable response");
 }
 if(!response.ok){
  const error=(payload as {error?:{code?:string;message?:string}}|null)?.error;
  throw new ApiError(response.status,error?.code??"HTTP_ERROR",error?.message??"The operation could not be completed");
 }
 if(!payload||typeof payload!=="object"||!("data" in payload))
  throw new ApiError(502,"INVALID_RESPONSE","The service returned an incomplete response");
 return payload as Envelope<T>;
}
export async function api<T=unknown>(path:string,options:{
 method?:"GET"|"POST"|"PATCH"|"PUT"|"DELETE";body?:unknown;csrfToken?:string;
 idempotencyKey?:string;signal?:AbortSignal;
}={}):Promise<T>{
 const method=options.method??"GET";
 const headers:Record<string,string>={Accept:"application/json"};
 if(method!=="GET"){
  headers["Content-Type"]="application/json";
  if(options.csrfToken)headers["X-CSRF-Token"]=options.csrfToken;
  if(options.idempotencyKey)headers["Idempotency-Key"]=options.idempotencyKey;
 }
 const response=await request(path,{method,headers,
  ...(method!=="GET"?{body:JSON.stringify(options.body??{})}:{})},options.signal);
 return (await envelope<T>(response)).data;
}
export async function apiPage<T>(path:string,signal?:AbortSignal):Promise<{
 data:T[];meta:{nextCursor?:string|null;unreadCount?:number}}>{
 const payload=await envelope<T[]>(await request(path,{},signal));
 if(!Array.isArray(payload.data))throw new ApiError(502,"INVALID_RESPONSE","The service returned an invalid record list");
 return {data:payload.data,meta:payload.meta??{}};
}
export function newIdempotencyKey(){return crypto.randomUUID();}
export async function liveSession(signal?:AbortSignal):Promise<LiveSession>{
 const session=await api<LiveSession>("/auth/session",{signal});
 if(!["admin","driver","advertiser"].includes(session.role)||!session.csrfToken||
    !Number.isFinite(Date.parse(session.expiresAt))||Date.parse(session.expiresAt)<=Date.now())
  throw new ApiError(401,"SESSION_INVALID","Authentication needs renewal");
 return session;
}
export async function downloadApiCsv(path:string,filename:string){
 const r=await request(path);
 if(!r.ok)throw new ApiError(r.status,"EXPORT_FAILED","Could not export live records");
 if(!(r.headers.get("content-type")??"").includes("text/csv"))
  throw new ApiError(502,"EXPORT_TYPE_INVALID","Invalid export response");
 const url=URL.createObjectURL(await r.blob());
 try{
  const anchor=document.createElement("a");anchor.href=url;anchor.download=filename;
  document.body.append(anchor);anchor.click();anchor.remove();
 }finally{window.setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
