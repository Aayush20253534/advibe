-- Preserve Admin login provenance while permitting temporary MFA opt-out.
-- When MFA is turned on again, these password-only sessions fail authorization.
ALTER TABLE "Session" ADD COLUMN "adminPasswordVerifiedAt" TIMESTAMPTZ(6);
