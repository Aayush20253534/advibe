import { appendFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import type { AuthEmail,EmailSender } from "../modules/auth/email.js";
import type { CaptchaVerifier } from "../modules/enquiries/captcha.js";
import type { CashfreeGateway,CashfreeVerifiedPayment } from "../modules/payments/provider.js";
import type { RefundGateway,RefundObservation } from "../modules/finance/provider.js";
import type { PayoutGateway,RemoteTransfer } from "../modules/earnings/provider.js";
import type { PrivateCreativeStorage } from "../modules/creatives/storage.js";
import type { PrivateKycStorage } from "../modules/kyc/storage.js";
import { HttpError } from "../lib/http-error.js";
import { requireMock } from "./mock-mode.js";

type PendingOrder={amount:bigint;expiresAt:Date};
function noProviderEvidence(service:string):never {
 throw new HttpError(503,"MOCK_EXTERNAL_UNVERIFIED",service+" has no real provider evidence");
}
/** Local-only mailbox, never email real recipients. No public inbox endpoint. */
export function mockEmailSender(root=resolve(process.cwd(),".mock-local")):EmailSender {
 requireMock();
 return async ({to,subject,text}:AuthEmail)=>{
  await mkdir(root,{recursive:true,mode:0o700});
  await appendFile(join(root,"mailbox.jsonl"),JSON.stringify({
    timestamp:new Date().toISOString(),to,subject,text
   })+"\n",{encoding:"utf8",mode:0o600});
 };
}
/** Explicit developer token only; do not use to bypass public CAPTCHA. */
export function mockCaptchaVerifier():CaptchaVerifier {
 requireMock();
 return async token=>token==="advibe-local-mock-turnstile-accepted";
}
/** Checkout can be opened as a fake pending order, but never becomes paid. */
export function mockCashfreeGateway():CashfreeGateway {
 requireMock();
 const orders=new Map<string,PendingOrder>();
 const pending=(id:string):PendingOrder=>{
  const order=orders.get(id);
  if(!order)noProviderEvidence("Cashfree order");
  return order!;
 };
 return {
  async createOrder(input){
   orders.set(input.providerOrderId,{amount:input.amountPaise,expiresAt:input.expiresAt});
   return {providerOrderId:input.providerOrderId,
    paymentSessionId:"mock_pending_"+input.providerOrderId,
    orderAmountPaise:input.amountPaise,currency:"INR"};
  },
  async getOrder(id){
   const order=pending(id);
   return {providerOrderId:id,status:"ACTIVE",amountPaise:order.amount,currency:"INR"};
  },
  async getPayment(orderId,paymentId):Promise<CashfreeVerifiedPayment>{
   const order=pending(orderId);
   return {providerOrderId:orderId,providerPaymentId:paymentId,status:"PENDING",
    amountPaise:order.amount,currency:"INR"};
  },
  async listPayments(orderId){
   pending(orderId);
   return [];
  }
 };
}
/** Refund requests remain pending; a mock can never authorize a credit note. */
export function mockRefundGateway():RefundGateway {
 requireMock();
 const pending=new Map<string,RefundObservation>();
 const key=(orderId:string,refundId:string)=>orderId+":"+refundId;
 return {
  async createRefund(orderId,refundId,amountPaise){
   const item:RefundObservation={orderId,refundId,amountPaise,currency:"INR",status:"PENDING"};
   pending.set(key(orderId,refundId),item);return item;
  },
  async getRefund(orderId,refundId){
   const item=pending.get(key(orderId,refundId));
   if(!item)noProviderEvidence("Refund");
   return item!;
  },
  async getOrder(orderId){return noProviderEvidence("Refund order "+orderId);},
  async listPayments(){return [];}
 };
}
/** No beneficiary is bank-verified and no money-transfer is ever initiated. */
export function mockPayoutGateway():PayoutGateway {
 requireMock();
 return {
  async verifyBeneficiary(token,driverUserId){
   return {token,driverUserId,verified:false,provider:"cashfree"};
  },
  async createTransfer():Promise<RemoteTransfer>{
   return noProviderEvidence("Payout transfer");
  },
  async getTransfer():Promise<RemoteTransfer>{
   return noProviderEvidence("Payout transfer");
  }
 };
}
/** Intentionally reject real media bytes; no fake malware scan or signed S3 URL. */
export function mockCreativeStorage():PrivateCreativeStorage {
 requireMock();
 return {
  async signedPut(){return noProviderEvidence("Creative storage");},
  async head(){return noProviderEvidence("Creative storage");},
  async readVersion(){return noProviderEvidence("Creative storage");},
  async writeProcessed(){return noProviderEvidence("Creative storage");},
  async signedGet(){return noProviderEvidence("Creative storage");},
 };
}
/** Never collect real licence or registration documents in mock mode. */
export function mockKycStorage():PrivateKycStorage {
 requireMock();
 return {
  async presignPut(){return noProviderEvidence("Private KYC storage");},
  async head(){return noProviderEvidence("Private KYC storage");},
  async presignGet(){return noProviderEvidence("Private KYC storage");},
 };
}
