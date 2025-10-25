export interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string;
  products: VoucherProductDetail[];
}

export interface VoucherProduct {
  productId: string;
  productName: string;
  productImageUrl: string;
}

export interface VoucherProductDetail {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
}

export interface VoucherSummaryItem {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string;
  products: VoucherProductDetail[];
}

export type DiscountType = 'PERCENT' | 'FIXED_AMOUNT';

export interface CreateOrUpdateVoucherRequest {
  voucherId: string | null;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productIds: string[];
}

export interface CreateOrUpdateVoucherResponse {
  success: boolean;
  errors?: Record<string, string[]>;
  validationErrors?: Record<string, string[]>;
  data?: string;
}

export interface SearchVouchersQuery {
  PageNumber: number;
  PageSize: number;
  SearchTerm?: string;
  DiscountType?: string;
  IsActive?: boolean;
  ProductId?: string;
}

export interface SearchVouchersResponse {
  success: boolean;
  errors?: Record<string, string[]>;
  validationErrors?: Record<string, string[]>;
  data?: {
    items: VoucherSummaryItem[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface GetVoucherByIdResponse {
  success: boolean;
  errors?: Record<string, string[]>;
  validationErrors?: Record<string, string[]>;
  data?: {
    id: string;
    code: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: string;
    endDate: string;
    usedCount: number;
    isActive: boolean;
    createdAt: string;
    lastModifiedAt: string;
    products: VoucherProduct[];  // This should be VoucherProduct array with productId
    productDetails: VoucherProductDetail[];  // This is the full product details array
  };
}

export interface DeleteVoucherByIdResponse {
  success: boolean;
  errors?: Record<string, string[]>;
  validationErrors?: Record<string, string[]>;
  data?: boolean;
}

export interface AddToProductRequest {
  voucherId: string;
  productIds: string[];
}

export interface AddToProductResponse {
  success: boolean;
  errors?: Record<string, string[]>;
  validationErrors?: Record<string, string[]>;
  data?: boolean;
}

export interface RemoveFromProductRequest {
  voucherId: string;
  productIds: string[];
}

export interface RemoveFromProductResponse {
  success: boolean;
  errors?: Record<string, string[]>;
  validationErrors?: Record<string, string[]>;
  data?: boolean;
}

export interface GetVouchersByProductResponse {
  success: boolean;
  errors?: Record<string, string[]>;
  validationErrors?: Record<string, string[]>;
  data?: VoucherSummaryItem[];
}
