import { z } from "zod";
const email = z.email().max(320).transform(value => value.trim().toLowerCase());
/** Shared rule for new registrations and password resets; legacy sign-ins stay valid. */
export const accountPasswordSchema = z.string().min(12, "Use at least 12 characters").max(128)
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[^A-Za-z0-9\s]/, "Include a symbol (not whitespace)");
export const registerSchema = z.strictObject({
  email, password: accountPasswordSchema, displayName: z.string().trim().min(1).max(100),
  role: z.enum(["advertiser", "driver"]),
});
export const loginSchema = z.strictObject({
  email, password: z.string().min(1).max(256), remember: z.boolean().optional(),
});
export const verifySchema = z.strictObject({
  challengeId: z.uuid(), code: z.string().regex(/^\d{6}$/),
});
export const emailSchema = z.strictObject({ email });
export const resetSchema = z.strictObject({
  resetToken: z.string().regex(/^[a-f0-9-]{36}\.[A-Za-z0-9_-]{43}$/i),
  newPassword: accountPasswordSchema,
});

export const mfaVerifySchema = z.strictObject({
  challengeId: z.uuid(),
  ticket: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  code: z.string().regex(/^[0-9]{6}$/),
});
