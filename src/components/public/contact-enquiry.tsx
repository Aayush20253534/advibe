"use client";

import * as React from "react";
import Link from "next/link";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";
import { FAQList } from "./faq-list";
import { publicFAQs } from "./faq-data";
import { textLink } from "./marketing-blocks";

const subjects = [
  "Campaign enquiry",
  "Driver partnership",
  "Screen availability",
  "Pricing request",
  "Technical support",
  "Other",
];

export function ContactEnquiry() {
  const [feedback, setFeedback] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim(),
      email = String(data.get("email") ?? "").trim(),
      phone = String(data.get("phone") ?? "").trim(),
      role = String(data.get("role") ?? ""),
      subject = String(data.get("subject") ?? "");
    if (!name || !email || !/^\d{10}$/.test(phone) || !subject || !message.trim()) {
      setFeedback("");
      setError("Fill in every required field. The phone number needs 10 digits.");
      return;
    }
    const body = [
      "Name: " + name,
      "Email: " + email,
      "Phone: +91 " + phone,
      "Type: " + role,
      "",
      message,
    ].join("\n");
    setError("");
    setFeedback(
      "Your email app is opening with this message. Send it from there: nothing has been sent from this website.",
    );
    window.location.href =
      "mailto:support@advibe.in?subject=" +
      encodeURIComponent("[AdVibe] " + subject) +
      "&body=" +
      encodeURIComponent(body);
  }
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <form
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
          This form prepares an email in your own email app. You send it from there.
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
            description={`${message.length} of 500 characters`}
            required
            className="sm:col-span-2"
          >
            <Textarea
              rows={5}
              minLength={10}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </Field>
        </div>
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
        <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
          Open in my email app
        </Button>
      </form>

      <div className="space-y-8">
        <div>
          <h2 className="font-heading text-xl font-semibold text-ink">Other ways to reach us</h2>
          <ul className="mt-4 space-y-4 text-base">
            <li>
              <p className="text-ink-muted">Email</p>
              <a href="mailto:support@advibe.in" className={textLink}>
                support@advibe.in
              </a>
            </li>
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
