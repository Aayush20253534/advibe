import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { api, apiPage, ApiError, downloadApiCsv } from "../src/services/api-client.ts";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test("all client entry points reject invalid paths before fetching", async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error("must not fetch"); };
  for (const path of ["https://example.invalid", "//example.invalid", "/../auth", "/auth#session", "/auth\\session"]) {
    for (const run of [() => api(path), () => apiPage(path), () => downloadApiCsv(path, "records.csv")]) {
      await assert.rejects(run, e => e instanceof ApiError && e.code === "INVALID_PATH");
    }
  }
  assert.equal(calls, 0);
});

test("network failures and unreadable responses produce actionable typed errors", async () => {
  globalThis.fetch = async () => { throw new TypeError("offline"); };
  await assert.rejects(() => apiPage("/campaigns"), e => e.status === 503 && e.code === "NETWORK_UNAVAILABLE");
  globalThis.fetch = async () => new Response("<html>unavailable</html>", { status: 503 });
  await assert.rejects(() => api("/auth/session"), e => e.status === 503 && e.code === "INVALID_RESPONSE");
  globalThis.fetch = async () => Response.json({ meta: {} });
  await assert.rejects(() => api("/auth/session"), e => e.status === 502 && e.code === "INVALID_RESPONSE");
});

test("paginated responses validate lists and retain cursor metadata", async () => {
  globalThis.fetch = async () => Response.json({ data: {}, meta: {} });
  await assert.rejects(() => apiPage("/campaigns"), e => e.code === "INVALID_RESPONSE");
  globalThis.fetch = async () => Response.json({ data: [{ id: "one" }], meta: { nextCursor: "next" } });
  assert.deepEqual(await apiPage("/campaigns"), { data: [{ id: "one" }], meta: { nextCursor: "next" } });
});

test("mutations preserve session, CSRF and idempotency; no automatic retry", async () => {
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(url, "/api/backend/campaigns");
    assert.equal(init.credentials, "same-origin");
    assert.equal(init.cache, "no-store");
    assert.equal(init.headers["X-CSRF-Token"], "csrf");
    assert.equal(init.headers["Idempotency-Key"], "key");
    assert.equal(init.body, '{"title":"Test"}');
    assert.ok(init.signal instanceof AbortSignal);
    return Response.json({ error: { code: "CONFLICT", message: "Already changed" } }, { status: 409 });
  };
  await assert.rejects(() => api("/campaigns", { method: "POST", csrfToken: "csrf", idempotencyKey: "key", body: { title: "Test" } }), e => e.status === 409 && e.code === "CONFLICT");
  assert.equal(calls, 1);
});

test("caller aborts remain aborts, not user-visible network errors", async () => {
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async (_url, init) => { init.signal.throwIfAborted(); };
  await assert.rejects(() => apiPage("/campaigns", controller.signal), e => e.name === "AbortError");
});


test("role-scoped login sends the selected account type without adding a body property", async () => {
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "/api/backend/auth/login");
    assert.equal(init.headers["X-Login-Role"], "driver");
    assert.equal(init.body, '{"email":"driver@example.invalid","password":"SecurePass"}');
    return Response.json({ data: { userId: "id", role: "driver" } }, { status: 201 });
  };
  const user = await api("/auth/login", { method: "POST", loginRole: "driver",
    body: { email: "driver@example.invalid", password: "SecurePass" } });
  assert.equal(user.role, "driver");
});
