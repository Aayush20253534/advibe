import assert from "node:assert/strict";
import test from "node:test";
import { BodyLimitError, readBoundedBody, sessionCookies, isSessionSetCookie } from "../src/services/relay-boundaries.mjs";

test("bounded relay accepts exact limit, empty and multi-byte bodies", async () => {
  const text = new TextEncoder().encode('"नमस्ते"');
  const stream = new ReadableStream({ start(c) { c.enqueue(text.slice(0,3)); c.enqueue(text.slice(3)); c.close(); } });
  assert.deepEqual(await readBoundedBody(stream,text.length),text);
  assert.equal((await readBoundedBody(null,10)).length,0);
});
test("relay rejects oversized chunks early and cancels the producer", async () => {
  let reads=0,cancelled=false;
  const stream = new ReadableStream({ pull(c) { reads++; c.enqueue(new Uint8Array(5)); }, cancel() { cancelled=true; } }, { highWaterMark:0 });
  await assert.rejects(readBoundedBody(stream,8),BodyLimitError);
  assert.equal(reads,2);
  assert.equal(cancelled,true);
});
test("relay aborts a stalled stream without waiting for its producer", async () => {
  const controller=new AbortController();
  let cancelled=false;
  const stream=new ReadableStream({ pull() { return new Promise(()=>{}); }, cancel() { cancelled=true; } });
  const pending=readBoundedBody(stream,8,controller.signal);
  controller.abort(new Error("stopped"));
  await assert.rejects(pending,/stopped/);
  assert.equal(cancelled,true);
  await assert.rejects(readBoundedBody(null,8,controller.signal),/stopped/);
});
test("relay forwards only session cookies and preserves duplicate rejection semantics", () => {
  assert.equal(sessionCookies("analytics=tracking; advibe_dev_session=one; other=private; advibe_dev_session=two"),"advibe_dev_session=one; advibe_dev_session=two");
  assert.equal(sessionCookies("__Host-advibe_session=secure; prefix_advibe_dev_session=no"),"__Host-advibe_session=secure");
  assert.equal(sessionCookies(null),"");
  assert.equal(isSessionSetCookie("__Host-advibe_session=x; Secure; HttpOnly"),true);
  assert.equal(isSessionSetCookie("analytics=x; Domain=.example.com"),false);
});
