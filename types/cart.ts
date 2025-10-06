import type { ApiEnvelope } from './shared';

export interface AddCartItemRequest {
  productVariantId: string;
  productDesignId: string;
  quantity: number;
}

export interface DeleteCartItemsRequest {
  cartItemIds: string[];
}

export type AddCartItemResponse = ApiEnvelope<string>;
export type DeleteCartItemsResponse = ApiEnvelope<boolean>;





