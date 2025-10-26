// Feedback types for product review endpoints

export interface CreateFeedbackRequest {
  orderId: string;
  feedback: string;
  rating: number;
}

export interface CreateFeedbackResponse {
  message?: string;
}

export interface FeedbackItem {
  id: string;
  orderId?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  productId: string;
  feedback: string;
  rating: number;
  createdBy?: {
    userId: string;
    name: string;
    email: string | null;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface GetProductFeedbacksResponse {
  feedbacks: FeedbackItem[];
  averageRating: number;
  totalCount: number;
}
