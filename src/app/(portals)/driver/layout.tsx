import {ApiPortal} from "@/features/live/api-portal";
// Each authenticated portal is server-backed. The legacy page children are
// intentionally not rendered until their API-backed replacements are shipped.
export default function DriverLayout({children}:{children:React.ReactNode}){
 void children;
 return <ApiPortal role="driver"/>;
}
