import {redirect} from "next/navigation";
/** Use the canonical /login route to retain one live session and MFA flow. */
export default function Page(){redirect("/login");}
