export class BodyLimitError extends Error {
  constructor() { super("Body exceeds the relay limit"); this.name = "BodyLimitError"; }
}

/** Stop reading at the limit, including chunked bodies without Content-Length. */
export async function readBoundedBody(stream, maxBytes, signal) {
  if (signal?.aborted) throw signal.reason;
  if (!stream) return new Uint8Array();
  const reader = stream.getReader();
  const chunks = [];
  let length = 0;
  let onAbort;
  const aborted = new Promise((_, reject) => {
    onAbort = () => reject(signal.reason);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), aborted]);
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) throw new BodyLimitError();
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return bytes;
  } catch (error) {
    // Cancellation must not wait on an unresponsive remote producer.
    void reader.cancel(error).catch(() => {});
    throw error;
  } finally {
    signal?.removeEventListener("abort", onAbort);
    reader.releaseLock();
  }
}

const sessionCookieNames = new Set(["__Host-advibe_session", "advibe_dev_session"]);
export function sessionCookies(raw) {
  // Preserve duplicate session cookies: the backend rejects ambiguity itself.
  return (raw ?? "").split(";").map((entry) => entry.trim())
    .filter((entry) => sessionCookieNames.has(entry.slice(0, entry.indexOf("="))))
    .join("; ");
}
export function isSessionSetCookie(raw) {
  return sessionCookieNames.has(raw.slice(0, raw.indexOf("=")));
}
