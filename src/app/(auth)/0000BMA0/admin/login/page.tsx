import {BmaLoginFallback,BmaLoginForm} from "@/components/auth/bma-login-form";
import type {Metadata} from "next";
import {Suspense} from "react";
export const metadata:Metadata={title:"Admin Sign In",robots:{index:false,follow:false}};
export default function AdminSignInPage(){
 return <Suspense fallback={<BmaLoginFallback/>}><BmaLoginForm/></Suspense>;
}
