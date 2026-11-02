import {ApiAuthScreen,AuthFallback} from "@/components/auth/api-auth-screen";
import type {Metadata} from "next";
import {Suspense} from "react";
export const metadata:Metadata={title:"Password Recovery",robots:{index:false,follow:false}};
export default function Page(){
 return <Suspense fallback={<AuthFallback mode="forgot"/>}><ApiAuthScreen mode="forgot"/></Suspense>;
}
