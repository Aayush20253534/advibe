import {portalHome} from "./admin-paths.mjs";

/** Return only paths within the authenticated role's own portal. */
export function safeAuthNext(candidate,role){
 if(!["admin","advertiser","driver"].includes(role))return "/login";
 const home=portalHome(role);
 if(typeof candidate!=="string"||candidate.length>1024||!candidate.startsWith("/")||
    candidate.startsWith("//")||candidate.includes("\\")||candidate.includes("\n")||
    /%(?:2f|5c|0a|0d|2e)/i.test(candidate))return home;
 const path=candidate.split(/[?#]/,1)[0];
 if(path.split("/").some(segment=>segment==="."||segment===".."))return home;
 return path===home||path.startsWith(home+"/")?candidate:home;
}
