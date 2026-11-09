import { AdminPortal } from "@/features/admin-live/portal";
import "@/features/admin-live/admin-theme.css";

// The layout checks the MFA-verified Admin session once; each page renders its own live screen.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPortal>{children}</AdminPortal>;
}
