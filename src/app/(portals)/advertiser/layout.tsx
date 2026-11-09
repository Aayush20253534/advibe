import { AdvertiserPortal } from "@/features/advertiser-live/portal";
import "@/features/advertiser-live/advertiser-theme.css";

// The layout checks the advertiser session once; each page renders its own live screen.
export default function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  return <AdvertiserPortal>{children}</AdvertiserPortal>;
}
