import "@/components/auth/bma-auth-reference.css";
import {AuthFrame} from "@/components/auth/auth-frame";
export default function AuthLayout({children}:{children:React.ReactNode}){
 return <AuthFrame>{children}</AuthFrame>;
}
