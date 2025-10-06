// Base reusable types for API envelopes and pagination, etc.

export interface ApiEnvelopeBase {
  errors?: Record<string, string[]>;
  validationErrors?: Record<string, string[]>;
  success: boolean;
}

export interface ApiEnvelopeWithData<TData> extends ApiEnvelopeBase {
  data: TData;
}

export interface ApiEnvelopeOptionalData<TData> extends ApiEnvelopeBase {
  data?: TData;
}

export type ApiEnvelope<TData> = ApiEnvelopeOptionalData<TData>;





