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
  isFeedback: boolean;
}

export interface CreateOrderResponse {
  orderId: string;
  orderDate: string;
  status: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  paymentMethod: string;
  paymentCode?: string;
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

// Order Status Constants
export enum OrderStatus {
  PENDING = 0,
  REJECTED = 1,
  PROCESSING = 2,
  SHIPPED = 3,
  DELIVERED = 4,
  CONFIRM_RECEIVED = 5,
  CANCELLED = 6,
  RETURNED = 7,
  EXPIRED = 8,
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.REJECTED]: 'Từ chối',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.SHIPPED]: 'Đã gửi hàng',
  [OrderStatus.DELIVERED]: 'Đã giao hàng',
  [OrderStatus.CONFIRM_RECEIVED]: 'Xác nhận đã nhận',
  [OrderStatus.CANCELLED]: 'Đã hủy',
  [OrderStatus.RETURNED]: 'Trả hàng',
  [OrderStatus.EXPIRED]: 'Hết hạn',
}

// Payment Status Constants
export enum PaymentStatus {
  ONLINE_PAYMENT_AWAITING = 0,
  ONLINE_PAYMENT_PAID = 1,
  COD = 2,
  REFUNDING = 3,
  REFUNDED = 4,
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.ONLINE_PAYMENT_AWAITING]: 'Chờ thanh toán',
  [PaymentStatus.ONLINE_PAYMENT_PAID]: 'Đã thanh toán',
  [PaymentStatus.COD]: 'Thanh toán khi nhận',
  [PaymentStatus.REFUNDING]: 'Đang hoàn tiền',
  [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',
}

// User Actions for Order Status Update
export enum UserOrderAction {
  CONFIRM_RECEIVED = 1,
  CANCEL_ORDER = 2,
}
