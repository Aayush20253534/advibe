"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Bike, Building2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { api, ApiError, liveSession } from "@/services/api-client";
import { safeAuthNext } from "@/lib/auth-navigation.mjs";
import {ADMIN_LOGIN,ADMIN_ROOT} from "@/lib/admin-paths.mjs";

const field = "bma-auth-input";
const label = "bma-auth-label";

export function BmaLoginForm() {
  const router = useRouter(), params = useSearchParams(), pathname = usePathname();
  const [role, setRole] = React.useState<"advertiser" | "driver">((params.get("role") === "driver" || params.get("next") === "/driver" || params.get("next")?.startsWith("/driver/")) ? "driver" : "advertiser");
  const [email, setEmail] = React.useState(""), [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [code, setCode] = React.useState(""), [challengeId, setChallengeId] = React.useState(""), [ticket, setTicket] = React.useState("");
  const [loading, setLoading] = React.useState(false), [error, setError] = React.useState(""), [notice, setNotice] = React.useState("");
  const isMfa = Boolean(challengeId && ticket);
  const adminSignIn = pathname === ADMIN_LOGIN;
  const intendedRole = adminSignIn ? "admin" : role;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError(""); setNotice("");
    try {
      if (isMfa) {
        await api("/auth/mfa/verify", { method: "POST", body: { challengeId, ticket, code } });
      } else {
        // The base login contract accepts email and password. Some deployed
        // backends reject additional properties rather than ignoring them.
        // Send the optional persistence override only when explicitly unchecked;
        // the normal login remains compatible with both schema versions.
        const body = {
          email: email.trim().toLowerCase(),
          password,
          ...(!remember ? { remember: false } : {}),
        };
        const result = await api<{ challengeId?: string; ticket?: string }>("/auth/login", {
          method: "POST", body, loginRole: adminSignIn ? undefined : role,
        });
        if (result.challengeId&&result.ticket) {
          setChallengeId(result.challengeId); setTicket(result.ticket); setPassword("");
          setNotice("Enter the 6-digit code from your authenticator app.");
          return;
        }
      }
      const session = await liveSession();
      if (session.role !== intendedRole) {
        // An older backend might ignore X-Login-Role. Fail closed on the client,
        // revoke the newly issued session and never route into the other portal.
        let revoked = false;
        try {
          await api("/auth/logout", { method: "POST", csrfToken: session.csrfToken });
          revoked = true;
        } catch { /* The portal still enforces its own server-issued role. */ }
        throw new ApiError(403, "ACCOUNT_ROLE_MISMATCH", revoked
          ? "This account does not match the selected account type. Choose the correct tab to sign in."
          : "Account type mismatch. Sign out of your current session before trying again.");
      }
      router.replace(safeAuthNext(adminSignIn ? (params.get("next") || ADMIN_ROOT) : params.get("next"), session.role));
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError && err.code === "VALIDATION_ERROR" ? "Check your email and password format, then try again." : err instanceof ApiError ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const status=params.get("verified") === "1" ? "Email verified. Sign in to continue." :
    params.get("reset") === "1" ? "Password changed. Sign in again." : "";

  return (
    <section aria-labelledby="bma-login-title" className="bma-auth-card bma-reference-login-card">
      <header>
        <h1 id="bma-login-title">{isMfa ? "Verify authenticator" : "Sign in"}</h1>
        <p className="bma-reference-auth-intro">{isMfa ? "Complete your secure two-step sign-in." : adminSignIn ? "Access the MFA-protected BlinkMyAd administration portal." : "Access your advertiser or driver partner account."}</p>
      </header>

      {adminSignIn && !isMfa && <p className="mb-4 text-sm font-semibold text-[#174ca8]">Secure admin sign-in · authenticator required</p>}
      {!adminSignIn && !isMfa && <div className="bma-reference-role-tabs" role="group" aria-label="Account type">
        <button type="button" aria-pressed={role === "advertiser"} disabled={loading} onClick={() => setRole("advertiser")}>
          <Building2 aria-hidden="true" /><span>Advertiser</span>
        </button>
        <button type="button" aria-pressed={role === "driver"} disabled={loading} onClick={() => setRole("driver")}>
          <Bike aria-hidden="true" /><span>Driver partner</span>
        </button>
      </div>}

      <form onSubmit={submit}>
        <div className="bma-reference-form-fields">
          {isMfa ? (
            <div>
              <label className={label} htmlFor="bma-login-otp">Authenticator code</label>
              <div className="bma-reference-field-control">
                <LockKeyhole className="bma-reference-field-icon" aria-hidden="true" />
                <input id="bma-login-otp" className={field} inputMode="numeric" pattern="[0-9]{6}"
                  autoComplete="one-time-code" placeholder="6-digit code" minLength={6} maxLength={6}
                  required value={code} disabled={loading} onChange={e => setCode(e.target.value)} />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className={label} htmlFor="bma-login-email">Email</label>
                <div className="bma-reference-field-control">
                  <Mail className="bma-reference-field-icon" aria-hidden="true" />
                  <input id="bma-login-email" className={field} type="email" autoComplete="email"
                    placeholder="Enter your email" required maxLength={320} value={email}
                    disabled={loading} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="bma-login-password">Password</label>
                <div className="bma-reference-field-control">
                  <LockKeyhole className="bma-reference-field-icon" aria-hidden="true" />
                  <input id="bma-login-password" className={field + " pr-12"} type={showPassword ? "text" : "password"}
                    placeholder="Enter your password" autoComplete="current-password" required minLength={1}
                    maxLength={256} value={password} disabled={loading} onChange={e => setPassword(e.target.value)} />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword} disabled={loading} className="bma-reference-password-toggle"
                    onClick={() => setShowPassword(value => !value)}>
                    {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {!isMfa && <div className="bma-reference-login-options">
          <label><input type="checkbox" checked={remember} disabled={loading}
            onChange={event => setRemember(event.target.checked)} />Keep me signed in</label>
          <Link prefetch={false} href="/forgot-password">Forgot password?</Link>
        </div>}
        {(notice || (!isMfa && status)) && <p role="status" className="mt-4 rounded-lg border border-[#bbe6d3] bg-[#ebf8f1] px-3 py-2 text-sm text-[#17623a]">{notice || status}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg border border-[#f1baba] bg-[#fff1f1] px-3 py-2 text-sm text-[#a11c1c]">{error}</p>}
        <button type="submit" disabled={loading} className="bma-auth-submit">
          {loading ? "Signing in…" : isMfa ? "Verify authenticator" : "Sign in"}
        </button>
        {isMfa && <button type="button" disabled={loading}
          className="mt-4 block w-full text-center text-sm font-semibold text-signal hover:underline"
          onClick={() => { setChallengeId(""); setTicket(""); setCode(""); setNotice(""); setError(""); }}>
          Back to email sign-in
        </button>}
      </form>

      {!isMfa && !adminSignIn && <>
        <p className="bma-reference-auth-bottom">
          Don&apos;t have an account?{" "}
          <Link prefetch={false} href={"/signup?role=" + role}>Create a campaign <ArrowUpRight aria-hidden="true" className="inline-block size-4 align-[-2px]" /></Link>
        </p>
      }
    </section>
  );
}

export function BmaLoginFallback() {
  return <section aria-busy="true" className="bma-auth-card bma-reference-login-card">
    <p role="status" className="text-sm text-ink-muted">Loading secure sign-in…</p>
  </section>;
}
