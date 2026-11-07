import {BmaRecoveryFallback,BmaRecoveryForm} from "@/components/auth/bma-recovery-form";
import type {Metadata} from "next";
import {Suspense} from "react";
export const metadata:Metadata={title:"Forgot Password",robots:{index:false,follow:false}};
export default function Page(){
 return <Suspense fallback={<BmaRecoveryFallback mode="forgot"/>}><BmaRecoveryForm mode="forgot"/></Suspense>;
}
