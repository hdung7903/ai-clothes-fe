import type { ApiEnvelope } from './shared';

export interface SepayWebhookPayload {
  id: number;
  gateway: string;
  transactionDate: string; // ISO string
  accountNumber: string;
  subAccount: string;
  code: string;
  content: string;
  transferType: string;
  transferAmount: number;
  description: string;
  referenceCode: string;
  accumulated: number;
}

export type SepayWebhookResponse = ApiEnvelope<string>;
export type QrCodeResponse = ApiEnvelope<string>;

// Request body for creating a payment QR code
export interface QrCodeRequest {
  amount: number;
  paymentCode: string;
}





