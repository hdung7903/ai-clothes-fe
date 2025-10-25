import type { ApiEnvelope } from './shared';
import type { PagedResult } from './product';

// Create/Update
export interface ProductDesignIconRequest {
  imageUrl: string;
  sampleImageId?: string;
}

export interface ProductDesignTemplateRequest {
  templateId: string;
  designImageUrl: string;
}

export interface CreateOrUpdateProductDesignRequest {
  productDesignId: string | null;
  productId: string;
  productOptionValueId: string;
  name: string;
  icons: ProductDesignIconRequest[];
  templates: ProductDesignTemplateRequest[];
}

export type CreateOrUpdateProductDesignResponse = ApiEnvelope<string>;

// Search/List item
export interface ProductDesignIconItem {
  id: string;
  productDesignId: string;
  imageUrl: string;
}

export interface ProductDesignTemplateItem {
  productDesignId: string;
  templateId: string;
  designImageUrl: string;
  printAreaName: string;
  templateImageUrl: string;
}

export interface ProductDesignSummaryItem {
  id: string;
  productId: string;
  productOptionValueId: string;
  name: string;
  createdAt: string;
  lastModifiedAt: string;
  productName: string;
  productOptionValue: string;
  icons: ProductDesignIconItem[];
  templates: ProductDesignTemplateItem[];
}

export type SearchProductDesignsResponse = ApiEnvelope<PagedResult<ProductDesignSummaryItem>>;

// Detail
export interface ProductRef {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface OptionValueDetail {
  id: string;
  value: string;
  optionName: string;
}

export interface ProductDesignDetail extends ProductDesignSummaryItem {
  product: ProductRef;
  productOptionValueDetail: OptionValueDetail;
}

export type GetProductDesignByIdResponse = ApiEnvelope<ProductDesignDetail>;
export type DeleteProductDesignByIdResponse = ApiEnvelope<boolean>;
export type GetProductDesignsByProductResponse = ApiEnvelope<ProductDesignSummaryItem[]>;


