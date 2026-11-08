"use client";
import { usePathname } from "next/navigation";
import { BmaAuthFrame } from "@/components/auth/bma-auth-frame";
export function AuthFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mode = pathname === "/signup" ? "signup" : pathname === "/verify" ? "verify" : pathname === "/forgot-password" ? "forgot" : pathname === "/reset-password" ? "reset" : "login";
  return <BmaAuthFrame mode={mode}>{children}</BmaAuthFrame>;
}
