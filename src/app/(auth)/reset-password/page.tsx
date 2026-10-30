import {ApiAuthScreen} from "@/components/auth/api-auth-screen";
import type {Metadata} from "next";
import {Suspense} from "react";
export const metadata:Metadata={title:"Reset Password",robots:{index:false,follow:false}};
export default function Page(){
 return <Suspense fallback={<p role="status">Loading secure account form…</p>}><ApiAuthScreen mode="reset"/></Suspense>;
}
