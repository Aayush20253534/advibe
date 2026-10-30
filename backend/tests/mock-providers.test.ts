import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp,readFile,rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { externalMode } from "../src/integrations/mock-mode.js";
import { releaseGate } from "../src/ops/release.js";
import { mockCashfreeGateway,mockRefundGateway,mockPayoutGateway,
 mockCaptchaVerifier,mockEmailSender,mockCreativeStorage,mockKycStorage }
 from "../src/integrations/mock-providers.js";

test("mock external services require explicit non-production opt-in",()=>{
 assert.equal(externalMode({}),"live");
 assert.equal(externalMode({ADVIBE_EXTERNAL_MODE:"mock",NODE_ENV:"development"}),"mock");
 assert.throws(()=>externalMode({ADVIBE_EXTERNAL_MODE:"mock",NODE_ENV:"production"}),
  /forbidden in production/);
 assert.throws(()=>releaseGate({ADVIBE_EXTERNAL_MODE:"mock",NODE_ENV:"production"}),
  /cannot use development mock providers/);
 assert.throws(()=>externalMode({ADVIBE_EXTERNAL_MODE:"unknown"}),/live or mock/);
});
test("development mocks never settle real payments, refunds or payouts",async()=>{
 const previous=process.env.ADVIBE_EXTERNAL_MODE,env=process.env.NODE_ENV;
 process.env.ADVIBE_EXTERNAL_MODE="mock";process.env.NODE_ENV="test";
 try{
  const payment=mockCashfreeGateway();
  const order=await payment.createOrder({providerOrderId:"mock_test_order",
   amountPaise:12345n,customerId:"test",customerPhone:"9999999999",
   customerEmail:"test@example.invalid",expiresAt:new Date(Date.now()+60000)});
  assert.match(order.paymentSessionId,/^mock_pending_/);
  assert.equal((await payment.getOrder(order.providerOrderId)).status,"ACTIVE");
  assert.deepEqual(await payment.listPayments(order.providerOrderId),[]);
  assert.equal((await payment.getPayment(order.providerOrderId,"mock_test_payment")).status,"PENDING");
  const refund=mockRefundGateway();
  const initiated=await refund.createRefund("mock_test_order","refund_001",5000n,"test");
  assert.equal(initiated.status,"PENDING");
  assert.equal((await refund.getRefund("mock_test_order","refund_001")).status,"PENDING");
  await assert.rejects(refund.getOrder("mock_test_order"));
  const payouts=mockPayoutGateway();
  assert.equal((await payouts.verifyBeneficiary("test_token","user-id")).verified,false);
  await assert.rejects(payouts.createTransfer({
   reference:"transfer_001",beneficiaryToken:"test_token",amountPaise:5000n,currency:"INR"}));
  await assert.rejects(payouts.getTransfer("transfer_001"));
  assert.equal(await mockCaptchaVerifier()("advibe-local-mock-turnstile-accepted","127.0.0.1"),true);
  assert.equal(await mockCaptchaVerifier()("invalid","127.0.0.1"),false);
  await assert.rejects(mockCreativeStorage().signedPut("test","image/png",100,20));
  await assert.rejects(mockKycStorage().presignPut("test","image/png",100,20));
 }finally{
  if(previous===undefined)delete process.env.ADVIBE_EXTERNAL_MODE;
  else process.env.ADVIBE_EXTERNAL_MODE=previous;
  if(env===undefined)delete process.env.NODE_ENV;
  else process.env.NODE_ENV=env;
 }
});
test("email mock writes local-only preview and no message goes to Resend",async()=>{
 const old=process.env.ADVIBE_EXTERNAL_MODE,env=process.env.NODE_ENV;
 process.env.ADVIBE_EXTERNAL_MODE="mock";process.env.NODE_ENV="test";
 const dir=await mkdtemp(join(tmpdir(),"advibe-mock-mail-"));
 try{
  await mockEmailSender(dir)({to:"test@example.invalid",subject:"Test preview",text:"development only"});
  const lines=(await readFile(join(dir,"mailbox.jsonl"),"utf8")).trim().split("\n");
  assert.equal(lines.length,1);
  const message=JSON.parse(lines[0]!) as {to:string;subject:string;text:string};
  assert.equal(message.to,"test@example.invalid");
  assert.equal(message.text,"development only");
 }finally{
  await rm(dir,{recursive:true,force:true});
  if(old===undefined)delete process.env.ADVIBE_EXTERNAL_MODE;
  else process.env.ADVIBE_EXTERNAL_MODE=old;
  if(env===undefined)delete process.env.NODE_ENV;
  else process.env.NODE_ENV=env;
 }
});
