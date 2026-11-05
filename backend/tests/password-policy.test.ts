import assert from "node:assert/strict";
import test from "node:test";
import { accountPasswordSchema, registerSchema, resetSchema } from "../src/modules/auth/schemas.js";

test("registration and reset enforce uppercase, lowercase, symbol and length", () => {
  const good = "StrongExample!2026";
  const token = "11111111-1111-4111-8111-111111111111." + "b".repeat(43);
  assert.equal(accountPasswordSchema.parse(good), good);
  assert.ok(registerSchema.safeParse({
    email: "someone@example.com", displayName: "Someone", role: "advertiser",
    password: good,
  }).success);
  assert.equal(resetSchema.safeParse({ resetToken: token, newPassword: good }).success, true);
  const weak = [
    "alllowercase!2026",
    "ALLUPPERCASE!2026",
    "NoSymbol12345",
    "Ab1!",
    "UpperLowercase12 ",
  ];
  for (const password of weak) {
    assert.equal(accountPasswordSchema.safeParse(password).success, false,
      "Policy should reject " + password);
    assert.equal(resetSchema.safeParse({ resetToken: token, newPassword: password }).success, false);
  }
});
