import type {MetadataRoute} from "next";
import {siteOrigin} from "@/services/site-origin.mjs";

/** Search indexing is opt-in only after legal, factual, and operational release review. */
export default function robots():MetadataRoute.Robots{
 const enabled=process.env.SITE_INDEXING_ENABLED==="true"&&!!siteOrigin(process.env.NEXT_PUBLIC_APP_URL);
 return {
  rules:enabled
   ?[{userAgent:"*",allow:"/",disallow:["/admin", "/0000BMA0/admin","/advertiser","/driver","/login","/signup","/verify","/forgot-password","/reset-password","/design-system","/privacy","/terms","/api/"]}]
   :[{userAgent:"*",disallow:"/"}]
 };
}
