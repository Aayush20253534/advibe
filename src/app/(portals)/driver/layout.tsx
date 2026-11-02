import { ApiPortal } from "@/features/live/api-portal";

// The layout checks the driver session once; each page renders its API-backed section.
export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <ApiPortal role="driver">{children}</ApiPortal>;
}
