import {NextRequest,NextResponse} from "next/server";
import {allowedApiPath,backendOrigin} from "@/services/api-route-policy.mjs";
import {BodyLimitError,readBoundedBody,sessionCookies,isSessionSetCookie} from "@/services/relay-boundaries.mjs";
import {matchesRequestedLoginRole} from "@/services/login-role-guard.mjs";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const NO_STORE="no-store, max-age=0";
type Params={params:Promise<{path:string[]}>};
async function proxy(req:NextRequest,{params}:Params){
 const base=backendOrigin(process.env.ADVIBE_BACKEND_ORIGIN,
  process.env.NODE_ENV==="production");
 if(!base)return NextResponse.json({error:{code:"BACKEND_NOT_CONFIGURED",
  message:"Live backend has not been configured"}},{status:503,headers:{"Cache-Control":NO_STORE}});
 const path=(await params).path,method=req.method;
 if(!allowedApiPath(path,method)||req.nextUrl.search.length>2048)
  return NextResponse.json({error:{code:"PATH_FORBIDDEN",message:"API route unavailable"}},{status:404});
 if(method!=="GET"){
  const origin=req.headers.get("origin");
  const site=req.headers.get("sec-fetch-site");
  if(site==="cross-site"||origin!==req.nextUrl.origin)
   return NextResponse.json({error:{code:"ORIGIN_REQUIRED",
    message:"Same-origin request required"}},{status:403,headers:{"Cache-Control":NO_STORE}});
  if(req.headers.get("content-type")?.split(";")[0]?.trim()!=="application/json")
   return NextResponse.json({error:{code:"JSON_REQUIRED",message:"JSON required"}},{status:415});
 }
 const signal=AbortSignal.any([req.signal,AbortSignal.timeout(12000)]);
 const source=req.headers.get("content-length");
 if(method!=="GET"&&source&&(!/^\d+$/.test(source)||Number(source)>65536))
  return NextResponse.json({error:{code:"BODY_TOO_LARGE"}},{status:413});
 let body:string|undefined;
 if(method!=="GET"){
  try{
   body=new TextDecoder("utf-8",{fatal:true}).decode(await readBoundedBody(req.body,65536,signal));
   JSON.parse(body);
  }catch(error){
   const status=error instanceof BodyLimitError?413:signal.aborted?408:400;
   const code=status===413?"BODY_TOO_LARGE":status===408?"REQUEST_TIMEOUT":"INVALID_JSON";
   return NextResponse.json({error:{code}},{status,headers:{"Cache-Control":NO_STORE}});
  }
 }
 const headers=new Headers({Accept:"application/json"});
 if(method!=="GET"){
  headers.set("Content-Type","application/json");
  headers.set("Origin",req.nextUrl.origin);
  if(req.headers.has("x-csrf-token"))headers.set("X-CSRF-Token",req.headers.get("x-csrf-token")!);
  if(req.headers.has("idempotency-key"))headers.set("Idempotency-Key",req.headers.get("idempotency-key")!);
  // Only this vetted hint may cross the relay; all other client headers stay stripped.
  if(path.join("/")==="auth/login"){
   const loginRole=req.headers.get("x-login-role");
   if(loginRole==="advertiser"||loginRole==="driver")headers.set("X-Login-Role",loginRole);
  }
 }
 const cookie=sessionCookies(req.headers.get("cookie"));
 if(cookie)headers.set("Cookie",cookie);
 try{
  const upstream=await fetch(base+"/api/v1/"+path.join("/")+req.nextUrl.search,{
   method,headers,body,cache:"no-store",redirect:"manual",signal,
  });
  if(upstream.status>=300&&upstream.status<400){
   void upstream.body?.cancel().catch(()=>{});
   return NextResponse.json({error:{code:"UPSTREAM_REDIRECT_DENIED"}},{status:502});
  }
  const type=upstream.headers.get("content-type")??"";
  if(!type.includes("application/json")&&!type.includes("text/csv")){
   void upstream.body?.cancel().catch(()=>{});
   return NextResponse.json({error:{code:"UPSTREAM_CONTENT_INVALID"}},{status:502});
  }
  let bytes:Uint8Array<ArrayBuffer>;
  try{bytes=await readBoundedBody(upstream.body,2_000_000,signal);}catch(error){
   if(error instanceof BodyLimitError)
    return NextResponse.json({error:{code:"UPSTREAM_RESPONSE_TOO_LARGE"}},{status:502,headers:{"Cache-Control":NO_STORE}});
   throw error;
  }
  // A legacy backend can ignore X-Login-Role. Reject a mismatched login before
  // forwarding its session cookie, rather than relying on a client redirect.
  const requestedLoginRole=method==="POST"&&path.join("/")==="auth/login"
   ?req.headers.get("x-login-role"):null;
  if(!matchesRequestedLoginRole(requestedLoginRole,upstream.status,bytes))
   return NextResponse.json({error:{code:"ACCOUNT_ROLE_MISMATCH",
    message:"This account does not match the selected account type. Choose the correct sign-in tab."}},
    {status:403,headers:{"Cache-Control":NO_STORE}});
  const response=new NextResponse(bytes,{status:upstream.status,headers:{
   "Content-Type":type,"Cache-Control":NO_STORE,"X-Content-Type-Options":"nosniff",
   ...(upstream.headers.get("content-disposition")?
     {"Content-Disposition":upstream.headers.get("content-disposition")!}:{})}});
  for(const cookie of upstream.headers.getSetCookie())if(isSessionSetCookie(cookie))response.headers.append("Set-Cookie",cookie);
  const requestId=upstream.headers.get("x-request-id"),retryAfter=upstream.headers.get("retry-after");
  if(requestId&&/^[0-9a-f-]{36}$/i.test(requestId))response.headers.set("X-Request-ID",requestId);
  if(retryAfter&&/^\d{1,6}$/.test(retryAfter))response.headers.set("Retry-After",retryAfter);
  return response;
 }catch{
  return NextResponse.json({error:{code:"BACKEND_UNAVAILABLE",
   message:"The live service is unavailable; no demo data has been substituted"}},{
    status:503,headers:{"Cache-Control":NO_STORE}});
 }
}
export const GET=proxy;
export const POST=proxy;
export const PATCH=proxy;
export const PUT=proxy;
export const DELETE=proxy;
