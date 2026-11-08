"use client";

import * as React from "react";
import Link from "next/link";
import Script from "next/script";
import { api } from "@/services/api-client";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { FAQList } from "./faq-list";
import { publicFAQs } from "./faq-data";
import { textLink } from "./marketing-blocks";

type TurnstileApi = {
  render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }) => string;
  reset: (widgetId: string) => void;
  remove?: (widgetId: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }

const subjects = [
  "Campaign enquiry",
  "Driver partnership",
  "Screen availability",
  "Pricing request",
  "Technical support",
  "Other",
];

export function ContactEnquiry() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const widgetHost = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | null>(null);
  const [captchaToken, setCaptchaToken] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [feedback, setFeedback] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  function renderWidget() {
    if (!siteKey || !widgetHost.current || widgetId.current || !window.turnstile) return;
    widgetId.current = window.turnstile.render(widgetHost.current, {
      sitekey: siteKey,
      callback: setCaptchaToken,
      "expired-callback": () => setCaptchaToken(""),
      "error-callback": () => setCaptchaToken(""),
    });
  }

  React.useEffect(() => {
    return () => {
      if (widgetId.current && window.turnstile?.remove) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const role = String(data.get("role") ?? "");
    const subject = String(data.get("subject") ?? "");
    const consent = data.get("consent") === "on";

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{10}$/.test(phone) ||
        !subject || message.trim().length < 15 || !consent) {
      setFeedback("");
      setError("Complete every field, agree to the privacy notice, and enter a valid email, 10-digit phone number and message (15+ characters).");
      return;
    }

    const body = [
      "Launch city: Prayagraj",
      "Phone: +91 " + phone,
      "Enquiry type: " + role,
      "",
      message.trim(),
    ].join("\n");

    setError("");
    setFeedback("");

    if (siteKey) {
      if (!captchaToken) {
        setError("Complete the verification check before sending your enquiry.");
        return;
      }
      setSending(true);
      try {
        await api("/enquiries", { method: "POST", body: {
          name, email, subject: "[Prayagraj] " + subject,
          message: body, consent: true, captchaToken,
        } });
        setFeedback("Your enquiry has been received by BlinkMyAd.");
        form.reset();
        setMessage("");
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not send your enquiry.");
      } finally {
        setSending(false);
        setCaptchaToken("");
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
      }
      return;
    }

    setError("Public enquiries are not available yet. Existing members can use account support.");
  }
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      {siteKey ? <form
        id="enquiry"
        onSubmit={handleSubmit}
        noValidate
        aria-labelledby="enquiry-title"
        className="rounded-lg border border-line bg-surface p-5 sm:p-6"
      >
        <h2 id="enquiry-title" className="font-heading text-2xl font-semibold text-ink">
          Write to us
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          Send an enquiry directly to our team after the verification check.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="contact-name" required>
            <Input name="name" autoComplete="name" maxLength={100} />
          </Field>
          <Field label="Email address" htmlFor="contact-email" required>
            <Input name="email" type="email" autoComplete="email" maxLength={254} />
          </Field>
          <Field
            label="Phone number"
            htmlFor="contact-phone"
            description="10 digits, without +91"
            required
          >
            <Input
              name="phone"
              inputMode="numeric"
              autoComplete="tel-national"
              pattern="[0-9]{10}"
              maxLength={10}
            />
          </Field>
          <Field label="I am" htmlFor="contact-role" required>
            <Select name="role">
              <option>An advertiser or business</option>
              <option>A driver partner</option>
              <option>Someone else</option>
            </Select>
          </Field>
          <Field label="Subject" htmlFor="contact-subject" required className="sm:col-span-2">
            <Select name="subject" defaultValue="">
              <option value="" disabled>
                Choose a subject
              </option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field
            label="Message"
            htmlFor="contact-message"
            description={`${message.length} of 500 characters (minimum 15)`}
            required
            className="sm:col-span-2"
          >
            <Textarea
              rows={5}
              minLength={15}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>
        </div>
        <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-ink-muted">
          <input type="checkbox" name="consent" className="mt-1 size-4 accent-signal" required />
          <span>I agree that BlinkMyAd may use these details to respond to my enquiry. <Link href="/privacy" className="font-semibold text-signal underline">Privacy notice</Link></span>
        </label>
        {siteKey ? (
          <div className="mt-5">
            <div ref={widgetHost} aria-label="Human verification" />
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={renderWidget} />
          </div>
        ) : null}
        {error ? (
          <Alert tone="danger" className="mt-5">
            {error}
          </Alert>
        ) : null}
        {feedback ? (
          <Alert tone="success" className="mt-5">
            {feedback}
          </Alert>
        ) : null}
        <Button type="submit" size="lg" loading={sending} className="mt-6 w-full sm:w-auto">
          Send enquiry
        </Button>
      </form> : <section className="border-t-2 border-signal bg-paper p-6 sm:p-8" aria-labelledby="enquiry-title">
        <span className="bma-eyebrow">Prayagraj pilot</span>
        <h2 id="enquiry-title" className="mt-4 font-heading text-3xl font-bold tracking-tight">Start with your workspace.</h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-ink-muted">Public enquiries are not open yet. Create an advertiser account to start a campaign draft, or explore the driver partner application.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link href="/signup?role=advertiser" className="inline-flex min-h-11 items-center rounded-md bg-signal px-4 text-sm font-semibold text-white">Create an advertiser account</Link><Link href="/for-drivers" className={textLink + " inline-flex min-h-11 items-center"}>For driver partners</Link></div>
      </section>}

      <div className="space-y-8">
        <div>
          <h2 className="font-heading text-xl font-semibold text-ink">Account support</h2>
          <ul className="mt-4 space-y-4 text-base">

            <li>
              <p className="text-ink-muted">Already have an account?</p>
              <p className="text-ink">
                Open a support ticket from the Help section of your advertiser or driver portal.
              </p>
            </li>
            <li>
              <p className="text-ink-muted">Looking for an answer?</p>
              <Link href="/help-center" className={textLink}>
                Search the help centre
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-xl font-semibold text-ink">Common questions</h2>
          <div className="mt-4">
            <FAQList items={publicFAQs.slice(1, 5)} />
          </div>
        </div>
      </div>
    </div>
  );
}
