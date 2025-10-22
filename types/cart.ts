import type { ApiEnvelope } from './shared';

export interface AddCartItemRequest {
  productVariantId: string;
  productDesignId: string | null;
  quantity: number;
}

export interface DeleteCartItemsRequest {
  cartItemIds: string[];
}

export interface VariantOption {
  optionName: string;
  optionValue: string;
}

export interface CartItemResponse {
  cartId: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productVariantId: string;
  productVariantSku: string;
  unitPrice: number;
  stock: number;
  quantity: number;
  totalPrice: number;
  productDesignId: string | null;
  variantOptions: VariantOption[];
  createdAt: string;
}

export type AddCartItemResponse = ApiEnvelope<string>;
export type DeleteCartItemsResponse = ApiEnvelope<boolean>;
export type GetCartItemsResponse = ApiEnvelope<CartItemResponse[]>;





