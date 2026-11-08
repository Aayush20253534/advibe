export class BodyLimitError extends Error {}
export function readBoundedBody(stream: ReadableStream<Uint8Array> | null, maxBytes: number, signal?: AbortSignal): Promise<Uint8Array<ArrayBuffer>>;
export function sessionCookies(raw: string | null): string;
export function isSessionSetCookie(raw: string): boolean;
