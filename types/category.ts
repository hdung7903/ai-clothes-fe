import type { ApiEnvelope } from './shared';

export interface CategoryBase {
  id: string;
  parentCategoryId: string | null | undefined;
  subCategories: string[];
  name: string;
}

export type Category = CategoryBase;

export interface CreateOrUpdateCategoryRequest {
  id: string;
  name: string;
  parentCategoryId: string | null | undefined;
}

export type CreateOrUpdateCategoryResponse = ApiEnvelope<Category>;
export type GetAllCategoriesResponse = ApiEnvelope<Category[]>;
export type GetCategoryByIdResponse = ApiEnvelope<Category>;
export type DeleteCategoryByIdResponse = ApiEnvelope<string>;





