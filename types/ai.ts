// AI API Types
// Based on the OpenAPI schema provided

export interface AskData {
  uuid: string;
  question: string;
  [key: string]: any;
}

export interface TransformImage {
  image_url?: string;
  image_base64?: string;
  prompt: string;
  style?: string;
  strength?: number;
  [key: string]: any;
}

export interface GenerateNewImage {
  prompt: string;
  style?: string;
  size?: string;
  quality?: string;
  [key: string]: any;
}

export interface ModifyProduct {
  product_id: string;
  name?: string;
  description?: string;
  price?: number;
  category_id?: string;
  image_url?: string;
  [key: string]: any;
}

export interface ApiAi {
  api_key?: string;
  api_chatbot?: string;
  api_image?: string;
  provider?: string;
  model?: string;
  [key: string]: any;
}

export interface HTTPValidationError {
  detail?: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

// Response types (since the API returns empty objects, we'll use generic types)
export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Specific response types for each endpoint
export type AskQuestionResponse = string;

export type TransformImageResponse = AIResponse<{
  transformed_image_url?: string;
  transformed_image_base64?: string;
}>;

export type GenerateImageResponse = AIResponse<{
  generated_image_url?: string;
  generated_image_base64?: string;
}>;

export type UpdateProductResponse = AIResponse<{
  product_id: string;
  updated: boolean;
}>;

export type DeleteProductResponse = AIResponse<{
  product_id: string;
  deleted: boolean;
}>;

export type UpdateApiKeyResponse = AIResponse<{
  updated: boolean;
  provider?: string;
}>;
