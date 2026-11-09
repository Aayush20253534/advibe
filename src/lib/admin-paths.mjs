/** Canonical browser namespace only. Admin security comes from session role and MFA, not URL secrecy. */
export const ADMIN_ROOT = "/0000BMA0/admin";
export const ADMIN_LOGIN = ADMIN_ROOT + "/login";
export function portalHome(role){return role==="admin" ? ADMIN_ROOT : "/"+role;}
