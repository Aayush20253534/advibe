import type { AuthSettings } from "./settings.js";
export interface AuthEmail { to: string; subject: string; text: string; }
export type EmailSender = (email: AuthEmail) => Promise<void>;
export function createResendSender(settings: AuthSettings): EmailSender {
  return async email => {
    if (!settings.resendApiKey || !settings.mailFrom) throw new Error("Email transport not configured");
    let result: Response;
    try {
      result = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + settings.resendApiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ from: settings.mailFrom, to: [email.to],
          subject: email.subject, text: email.text }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      // No credentials, recipient addresses or provider response bodies in logs.
      process.stderr.write("Resend email request failed: network or timeout\n");
      throw new Error("Email provider unreachable");
    }
    if (!result.ok) {
      let providerCode = "unknown";
      try {
        const response: unknown = await result.json();
        if (response && typeof response === "object" && "name" in response &&
            typeof response.name === "string" && /^[a-zA-Z_]{1,48}$/.test(response.name)) {
          providerCode = response.name;
        }
      } catch { /* no provider message required */ }
      process.stderr.write("Resend email delivery rejected: HTTP " + result.status +
        ", provider code " + providerCode + "\n");
      throw new Error("Email provider rejected request");
    }
  };
}
