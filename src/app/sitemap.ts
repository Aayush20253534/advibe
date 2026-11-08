import type {MetadataRoute} from "next";
import {siteOrigin} from "@/services/site-origin.mjs";

const publicPaths=["/","/for-advertisers","/for-drivers","/ad-formats","/locations","/pricing","/about","/contact","/help-center"];

export default function sitemap():MetadataRoute.Sitemap{
 if(process.env.SITE_INDEXING_ENABLED!=="true")return [];
 const configured=siteOrigin(process.env.NEXT_PUBLIC_APP_URL);
 if(!configured)return [];
 const origin=new URL(configured);
 if(origin.protocol!=="https:")return [];
 return publicPaths.map(path=>({url:new URL(path,origin).toString(),changeFrequency:"weekly" as const,priority:path==="/"?1:0.7}));
}
