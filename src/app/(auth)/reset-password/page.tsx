import {BmaRecoveryFallback,BmaRecoveryForm} from "@/components/auth/bma-recovery-form";
import type {Metadata} from "next";
import {Suspense} from "react";
export const metadata:Metadata={title:"Reset Password",robots:{index:false,follow:false}};
export default function Page(){
 return <Suspense fallback={<BmaRecoveryFallback mode="reset"/>}><BmaRecoveryForm mode="reset"/></Suspense>;
}
