import type { ApiEnvelope } from './shared';

// Create/Update Request
export interface ProductOptionValueRequest {
  optionValueId: string | null;
  value: string;
  imageUrl: string[];
}

export interface ProductOptionRequest {
  optionId: string | null;
  name: string; // e.g., COLOR, SIZE
  values: ProductOptionValueRequest[];
}

export interface ProductVariantRequest {
  id: string | null;
  sku: string;
  price: number;
  stock: number;
  optionValues: Record<string, string>; // key=optionId/name, value=optionValueId/value
}

export interface CreateOrUpdateProductRequest {
  productId: string | null;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  categoryId: string;
  options: ProductOptionRequest[];
  variants: ProductVariantRequest[];
}

export type CreateOrUpdateProductResponse = ApiEnvelope<string>;

// Search Response
export interface ProductSummaryCreator {
  userId: string;
  name: string;
}

export interface ProductSummaryItem {
  productId: string;
  name: string;
  description: string;
  imageUrl: string;
  minPrice: number;
  maxPrice: number;
  createdBy: ProductSummaryCreator;
}

export interface PagedResult<TItem> {
  items: TItem[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type SearchProductsResponse = ApiEnvelope<PagedResult<ProductSummaryItem>>;

// Product Detail
export interface ProductOptionValueDetail {
  optionValueId: string;
  value: string;
  images: string[];
}

export interface ProductOptionDetail {
  optionId: string;
  name: string;
  values: ProductOptionValueDetail[];
}

export interface ProductVariantDetail {
  variantId: string;
  sku: string;
  price: number;
  stock: number;
  optionValues: Record<string, string>;
}

export interface ProductCategoryRef {
  categoryId: string;
  name: string;
}

export interface ProductDetail {
  productId: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  category: ProductCategoryRef;
  options: ProductOptionDetail[];
  variants: ProductVariantDetail[];
}

export type GetProductByIdResponse = ApiEnvelope<ProductDetail>;
export type DeleteProductByIdResponse = ApiEnvelope<boolean>;





