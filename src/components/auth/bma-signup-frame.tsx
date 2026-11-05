import type {ReactNode} from "react";
import {BmaAuthFrame} from "@/components/auth/bma-auth-frame";
/** Compatibility entrypoint: the canonical layout is now shared with sign-in. */
export function BmaSignupFrame({children}:{children:ReactNode}){
 return <BmaAuthFrame mode="signup">{children}</BmaAuthFrame>;
}
