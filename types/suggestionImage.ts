import type { ApiEnvelope } from './shared';
import type { PagedResult } from './product';

// Suggestion Image Types
export interface SuggestionImage {
  id: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestionImageSummaryItem {
  id: string;
  imageUrl: string;
  isActive: boolean;
}

export interface CreateSuggestionImageRequest {
  imageUrl: string;
}

export interface UpdateSuggestionImageRequest {
  id: string;
  imageUrl?: string;
}

export interface SearchSuggestionImagesQuery {
  PageNumber?: number;
  PageSize?: number;
  SearchTerm?: string;
  Category?: string;
  IsActive?: boolean;
  SortBy?: 'name' | 'createdAt' | 'displayOrder';
  SortOrder?: 'asc' | 'desc';
}

// API Response Types
export type CreateSuggestionImageResponse = ApiEnvelope<SuggestionImage>;
export type UpdateSuggestionImageResponse = ApiEnvelope<SuggestionImage>;
export type GetSuggestionImageByIdResponse = ApiEnvelope<SuggestionImage>;
export type DeleteSuggestionImageByIdResponse = ApiEnvelope<boolean>;
export type SearchSuggestionImagesResponse = ApiEnvelope<PagedResult<SuggestionImageSummaryItem>>;
export type GetAllActiveSuggestionImagesResponse = ApiEnvelope<SuggestionImageSummaryItem[]>;
