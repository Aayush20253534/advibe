"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Bike, Building2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { api, ApiError, liveSession } from "@/services/api-client";
import { safeAuthNext } from "@/lib/auth-navigation.mjs";

const field = "bma-auth-input";
const label = "bma-auth-label";

export function BmaLoginForm() {
  const router = useRouter(), params = useSearchParams();
  const [role, setRole] = React.useState<"advertiser" | "driver">(params.get("role") === "driver" ? "driver" : "advertiser");
  const [email, setEmail] = React.useState(""), [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [code, setCode] = React.useState(""), [challengeId, setChallengeId] = React.useState(""), [ticket, setTicket] = React.useState("");
  const [loading, setLoading] = React.useState(false), [error, setError] = React.useState(""), [notice, setNotice] = React.useState("");
  const isMfa = Boolean(challengeId && ticket);

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
          method: "POST", body,
        });
        if (result.challengeId&&result.ticket) {
          setChallengeId(result.challengeId); setTicket(result.ticket); setPassword("");
          setNotice("Enter the 6-digit code from your authenticator app.");
          return;
        }
      }
      const session = await liveSession();
      router.replace(safeAuthNext(params.get("next"), session.role));
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
        <p className="bma-reference-auth-intro">{isMfa ? "Complete your secure two-step sign-in." : "Access your advertiser or driver partner account."}</p>
      </header>

      {!isMfa && <div className="bma-reference-role-tabs" role="group" aria-label="Account type">
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

      {!isMfa && <>
        <p className="bma-reference-social-divider">or continue with</p>
        <div className="bma-reference-social-buttons">
          <button type="button" disabled title="Google sign-in is not available yet"
            aria-label="Continue with Google (not available yet)">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M21.35 12.24c0-.74-.06-1.28-.21-1.84H12v3.54h5.37a4.61 4.61 0 0 1-2 3.03v2.48h3.21c1.87-1.72 2.77-4.26 2.77-7.21Z"/>
              <path fill="#34A853" d="M12 21.75c2.68 0 4.93-.88 6.58-2.3l-3.21-2.48c-.89.6-2.03.96-3.37.96-2.6 0-4.81-1.75-5.6-4.1H3.08v2.56A9.75 9.75 0 0 0 12 21.75Z"/>
              <path fill="#FBBC05" d="M6.4 13.53A5.9 5.9 0 0 1 6.09 12c0-.53.11-1.04.3-1.53V7.91H3.08a9.75 9.75 0 0 0 0 8.18l3.32-2.56Z"/>
              <path fill="#EA4335" d="M12 6.37c1.46 0 2.76.5 3.79 1.48l2.83-2.83A9.47 9.47 0 0 0 12 2.25a9.75 9.75 0 0 0-8.92 5.66l3.32 2.56c.79-2.35 3-4.1 5.6-4.1Z"/>
            </svg>
            Continue with Google
          </button>
          <button type="button" disabled title="Microsoft sign-in is not available yet"
            aria-label="Continue with Microsoft (not available yet)">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path fill="#F25022" d="M2 2h9.4v9.4H2z"/><path fill="#7FBA00" d="M12.6 2H22v9.4h-9.4z"/>
              <path fill="#00A4EF" d="M2 12.6h9.4V22H2z"/><path fill="#FFB900" d="M12.6 12.6H22V22h-9.4z"/>
            </svg>
            Continue with Microsoft
          </button>
        </div>
        <p className="bma-reference-auth-bottom">
          Don&apos;t have an account?{" "}
          <Link prefetch={false} href={"/signup?role=" + role}>Create a campaign <ArrowUpRight aria-hidden="true" className="inline-block size-4 align-[-2px]" /></Link>
        </p>
      </>}
    </section>
  );
}

export function BmaLoginFallback() {
  return <section aria-busy="true" className="bma-auth-card bma-reference-login-card">
    <p role="status" className="text-sm text-ink-muted">Loading secure sign-in…</p>
  </section>;
}
