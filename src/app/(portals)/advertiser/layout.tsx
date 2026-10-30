import {AdvertiserPortal} from "@/features/advertiser-live/portal";
// The advertiser section now has dedicated real API screens instead of the
// temporary generic table portal. Legacy standalone feature pages remain unreachable.
export default function AdvertiserLayout({children}:{children:React.ReactNode}){
 void children;
 return <AdvertiserPortal/>;
}
