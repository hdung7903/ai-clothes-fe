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

// Token Package Buy Request
export interface TokenPackageBuyRequest {
  tokenPackageId: string;
}

// Token Package Buy Response Data
export interface TokenPackageBuyData {
  paymentCode: string;
  amount: number;
}

export type TokenPackageBuyResponse = ApiEnvelope<TokenPackageBuyData>;

// Check Payment Status Request
export interface CheckPaymentStatusRequest {
  paymentCode: string;
}

// Check Payment Status Response Data
export interface CheckPaymentStatusData {
  isPaid: boolean;
  transactionDate?: string;
}

export type CheckPaymentStatusResponse = ApiEnvelope<CheckPaymentStatusData>;

// Check Token Package Is Paid Response
export interface CheckTokenPackageIsPaidData {
  isPaid: boolean;
}

export type CheckTokenPackageIsPaidResponse = ApiEnvelope<CheckTokenPackageIsPaidData>;

// Token Package Purchase History Item
export interface TokenPackagePurchaseHistoryItem {
  id: string;
  paymentCode: string;
  price: number;
  tokenAmount: number;
  createdByDto: {
    userId: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

// Paginated Response for Token Package Purchase History
export interface TokenPackagePurchaseHistoryData {
  items: TokenPackagePurchaseHistoryItem[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type TokenPackagePurchaseHistoryResponse = ApiEnvelope<TokenPackagePurchaseHistoryData>;







