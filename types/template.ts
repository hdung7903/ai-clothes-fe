import type { ApiEnvelope } from './shared';
import type { PagedResult } from './product';

// Create/Update
export interface CreateOrUpdateTemplateRequest {
  templateId: string;
  productId: string;
  productOptionValueId: string;
  printAreaName: string;
  imageUrl: string;
}

export type CreateOrUpdateTemplateResponse = ApiEnvelope<string>;

// List/Search item
export interface TemplateSummaryItem {
  id: string;
  productId: string;
  productOptionValueId: string;
  printAreaName: string;
  imageUrl: string;
  createdAt: string; // ISO string
  lastModifiedAt: string; // ISO string
  productName: string;
  productOptionName: string;
  productOptionValue: string;
}

export type SearchTemplatesResponse = ApiEnvelope<PagedResult<TemplateSummaryItem>>;

// Detail
export interface TemplateProductRef {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface TemplateOptionValueDetail {
  id: string;
  value: string;
  optionName: string;
}

export interface TemplateDetail {
  id: string;
  productId: string;
  productOptionValueId: string;
  printAreaName: string;
  imageUrl: string;
  createdAt: string;
  lastModifiedAt: string;
  productName: string;
  productOptionName: string;
  productOptionValue: string;
  product: TemplateProductRef;
  productOptionValueDetail: TemplateOptionValueDetail;
}

export type GetTemplateByIdResponse = ApiEnvelope<TemplateDetail>;
export type DeleteTemplateByIdResponse = ApiEnvelope<boolean>;
export type GetTemplatesByProductResponse = ApiEnvelope<TemplateSummaryItem[]>;





