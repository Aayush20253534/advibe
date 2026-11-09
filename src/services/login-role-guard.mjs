/** Fail closed when a role-scoped login returns a different backend-authoritative role.
 * The role in the response comes from the verified credentials, never the UI.
 * The guard runs in the Next API relay before upstream Set-Cookie can reach a browser.
 */
export function matchesRequestedLoginRole(requestedRole, status, responseBytes) {
  if (requestedRole !== "advertiser" && requestedRole !== "driver") return true;
  if (status !== 201) return true;
  try {
    const response = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(responseBytes));
    return response?.data?.role === requestedRole;
  } catch {
    return false;
  }
}
