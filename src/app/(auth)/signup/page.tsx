import {BmaSignupFallback,BmaSignupForm} from "@/components/auth/bma-signup-form";
import type {Metadata} from "next";
import {Suspense} from "react";
export const metadata:Metadata={title:"Create Account | BlinkMyAd",robots:{index:false,follow:false}};
export default function Page(){
 return <Suspense fallback={<BmaSignupFallback/>}><BmaSignupForm/></Suspense>;
}
