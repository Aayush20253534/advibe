"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bike, Building2, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { api, ApiError } from "@/services/api-client";

const field = "bma-auth-input";
const fieldLabel = "bma-auth-label";

export function BmaSignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = React.useState<"advertiser" | "driver">(params.get("role") === "driver" ? "driver" : "advertiser");
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [canResend, setCanResend] = React.useState(false);
  const passwordStrong=password.length>=12&&password.length<=128&&/[A-Z]/.test(password)&&/[a-z]/.test(password)&&/[^A-Za-z0-9\s]/.test(password);
  const rules = [
    { label: "12+ characters", met: password.length >= 12 && password.length <= 128 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Lowercase", met: /[a-z]/.test(password) },
    { label: "Symbol", met: /[^A-Za-z0-9\s]/.test(password) },
  ];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (!passwordStrong) {
      setError("Password must contain 12+ characters, uppercase, lowercase and a symbol.");
      return;
    }
    setLoading(true); setError(""); setNotice(""); setCanResend(false);
    try {
      const result=await api<{challengeId:string}>("/auth/register",{
        method:"POST",body:{role,email:email.trim().toLowerCase(),password,displayName:displayName.trim()},
      });
      setPassword("");
      router.replace("/verify?challengeId="+encodeURIComponent(result.challengeId));
    } catch (err) {
      if (err instanceof ApiError && err.code === "ACCOUNT_EXISTS") {
        setCanResend(true);
        setError("This email is already registered. Sign in, or resend verification if your account is pending.");
      } else if (err instanceof ApiError && err.code === "DELIVERY_UNAVAILABLE") {
        setCanResend(true);
        setError("Your pending account was saved, but the verification email could not be delivered. Retry with the same password or request another email.");
      } else {
        setError(err instanceof ApiError ? err.message : "Unable to reach the registration service. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    if (loading || !email.trim()) return;
    setLoading(true); setError(""); setNotice("");
    try {
      await api("/auth/resend-verification", { method: "POST", body: { email: email.trim().toLowerCase() } });
      setNotice("Verification requested. If your account is pending and email delivery is available, use the link in your inbox or spam folder.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not request another verification email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bma-auth-card bma-reference-signup-card" aria-labelledby="bma-signup-title">
      <h1 id="bma-signup-title">Create account</h1>
      <p className="bma-reference-auth-intro">
        Create an advertiser or driver partner account. We&apos;ll email you a code to confirm your address.
      </p>
      <div className="bma-reference-role-tabs bma-reference-signup-roles" role="group" aria-label="Account type">
        <button type="button" disabled={loading} aria-pressed={role === "advertiser"} onClick={() => setRole("advertiser")}>
          <Building2 aria-hidden="true" />
          <span><strong>Advertiser</strong><small>Run brand campaigns</small></span>
        </button>
        <button type="button" disabled={loading} aria-pressed={role === "driver"} onClick={() => setRole("driver")}>
          <Bike aria-hidden="true" />
          <span><strong>Driver partner</strong><small>Earn on your routes</small></span>
        </button>
      </div>
      <form onSubmit={submit}>
        <div className="bma-reference-form-fields">
          <div>
            <label className={fieldLabel} htmlFor="bma-signup-name">Full name</label>
            <div className="bma-reference-field-control">
              <UserRound className="bma-reference-field-icon" aria-hidden="true" />
              <input id="bma-signup-name" className={field} name="displayName" type="text"
                autoComplete="name" placeholder="Enter your full name" required minLength={1} maxLength={100}
                value={displayName} disabled={loading} onChange={e => setDisplayName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="bma-signup-email">Email</label>
            <div className="bma-reference-field-control">
              <Mail className="bma-reference-field-icon" aria-hidden="true" />
              <input id="bma-signup-email" className={field} name="email" type="email"
                autoComplete="email" placeholder="Enter your email" required maxLength={320}
                value={email} disabled={loading} onChange={e => { setEmail(e.target.value); setCanResend(false); }} />
            </div>
          </div>
          <div>
            <label htmlFor="bma-signup-password" className={fieldLabel}>Password</label>
            <div className="bma-reference-field-control">
              <LockKeyhole className="bma-reference-field-icon" aria-hidden="true" />
              <input id="bma-signup-password" className={field + " pr-12"}
                type={showPassword ? "text" : "password"} name="password"
                autoComplete="new-password" placeholder="Create a password"
                minLength={12} maxLength={128} required value={password}
                aria-invalid={password.length>0&&!passwordStrong}
                aria-describedby="bma-signup-password-hint" disabled={loading}
                onChange={e => setPassword(e.target.value)} />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword} disabled={loading} className="bma-reference-password-toggle"
                onClick={() => setShowPassword(value => !value)}>
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
        <div id="bma-signup-password-hint">
          <span className="sr-only">12+ characters · uppercase · lowercase · symbol</span>
          <ul className="bma-reference-password-rules" aria-label="Password requirements">
            {rules.map(rule => (
              <li key={rule.label} data-met={password.length > 0 && rule.met}>
                <CheckCircle2 aria-hidden="true" />{rule.label}
              </li>
            ))}
          </ul>
        </div>
        {error && <p role="alert" className="mb-3 rounded-lg border border-[#f4c6c6] bg-[#fff4f3] px-3 py-2 text-sm text-[#a72324]">{error}</p>}
        {canResend && <button type="button" disabled={loading} onClick={() => void resendVerification()}
          className="mb-3 text-left text-xs font-semibold text-signal hover:underline disabled:opacity-60">
          Resend verification email
        </button>}
        {notice && <p role="status" className="mb-3 rounded-lg border border-[#bce3d0] bg-[#effaf3] px-3 py-2 text-xs text-[#205c3f]">{notice}</p>}
        <button type="submit" disabled={loading} className="bma-auth-submit">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <div className="bma-reference-auth-bottom">
        Already have an account?{" "}
        <Link href={"/login?role=" + role}>Sign in</Link>
      </div>
    </section>
  );
}

export function BmaSignupFallback() {
  return <section aria-busy="true" className="bma-auth-card bma-reference-signup-card">
    <p role="status" className="text-sm text-ink-muted">Loading secure account form…</p>
  </section>;
}
