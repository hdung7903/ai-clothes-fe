export interface Voucher {
  voucherId: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    userId: string;
    name: string;
    email: string;
  };
}

export interface VoucherSummaryItem {
  voucherId: string;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  createdBy?: {
    userId: string;
    name: string;
  };
}

export interface CreateOrUpdateVoucherRequest {
  voucherId?: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
}

export interface CreateOrUpdateVoucherResponse {
  success: boolean;
  message?: string;
  data?: Voucher;
}

export interface SearchVouchersQuery {
  SearchTerm?: string;
  IsActive?: boolean;
  DiscountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  SortBy: 'CODE' | 'NAME' | 'CREATED_ON' | 'VALID_FROM' | 'VALID_TO';
  SortDescending: boolean;
  PageNumber: number;
  PageSize: number;
}

export interface SearchVouchersResponse {
  success: boolean;
  message?: string;
  data?: {
    items: VoucherSummaryItem[];
    totalPages: number;
    totalCount: number;
    pageNumber: number;
    pageSize: number;
  };
}

export interface GetVoucherByIdResponse {
  success: boolean;
  message?: string;
  data?: Voucher;
}

export interface DeleteVoucherByIdResponse {
  success: boolean;
  message?: string;
}
