import {AdminPortal} from "@/features/admin-live/portal";
/** The Admin portal now renders authenticated backend workflows only. */
export default function AdminLayout({children}:{children:React.ReactNode}){
 void children;
 return <AdminPortal/>;
}
