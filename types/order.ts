// Order types based on API schema

export interface OrderItem {
  productVariantId: string;
  designId: string | null;
  quantity: number;
}

export interface CreateOrderRequest {
  recipientPhone: string;
  recipientName: string;
  recipientAddress: string;
  paymentMethod: string;
  orderItems: OrderItem[];
  voucherCodes: string[];
  isCreated: boolean;
}

export interface OrderItemResponse {
  id: string;
  productVariantId: string;
  productDesignId: string;
  voucherId: string;
  name: string;
  variantSku: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  voucherCode: string;
  voucherDiscountAmount: number;
  voucherDiscountPercent: number;
}

export interface OrderCreatedBy {
  userId: string;
  name: string;
}

export interface OrderResponse {
  orderId: string;
  orderDate: string;
  status: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  paymentMethod: string;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  items: OrderItemResponse[];
  createdBy: OrderCreatedBy;
}

export interface CreateOrderResponse {
  orderId: string;
  orderDate: string;
  status: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  paymentMethod: string;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  items: OrderItemResponse[];
  createdBy: OrderCreatedBy;
}

export interface GetOrdersQuery {
  pageNumber: number;
  pageSize: number;
  status?: string;
}

export interface GetOrdersResponse {
  items: OrderResponse[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetOrderByIdResponse {
  orderId: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  paymentMethod: string;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  items: OrderItemResponse[];
  createdBy: OrderCreatedBy;
  userFeedback?: string;
  rating?: number;
}

// Admin and status update types

export interface UpdateOrderStatusByUserRequest {
  action: number;
  feedback?: string;
  rating?: number;
}

export type UpdateOrderStatusByUserResponse = string;

export interface AdminGetOrdersQuery {
  pageNumber: number;
  pageSize: number;
  status?: string; // PENDING, REJECTED, ACCEPTED, SHIPPED, CONFIRM_RECEIVED, CANCELLED, EXPIRED, RETURNED
  paymentStatus?: string; // String values like "ONLINE_PAYMENT_PAID"
  customerName?: string;
  customerEmail?: string;
}

export interface AdminOrderResponseItem extends OrderResponse {
  paymentStatus: string;
  userFeedback?: string;
  rating?: number;
}

export interface AdminGetOrdersResponse {
  items: AdminOrderResponseItem[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminUpdateOrderStatusRequest {
  status: number;
  notes?: string;
}

export type AdminUpdateOrderStatusResponse = string;

export interface AdminUpdatePaymentStatusRequest {
  paymentStatus: number;
  notes?: string;
}

export type AdminUpdatePaymentStatusResponse = string;

