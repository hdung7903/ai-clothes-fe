/**
 * Order Status Utilities
 * Helper functions and constants for managing order statuses
 */

import { OrderStatus, ORDER_STATUS_LABELS, PaymentStatus, PAYMENT_STATUS_LABELS } from '@/types/order'

// Order Status Flow Diagram
export const ORDER_STATUS_FLOW = {
  PENDING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['PROCESSING', 'REJECTED'],
  PROCESSING: ['SHIPPED', 'REJECTED'],
  SHIPPED: ['RETURNED'],
  CONFIRM_RECEIVED: [], // Final state
  REJECTED: [],         // Final state
  CANCELLED: [],        // Final state
  EXPIRED: [],          // Final state
  RETURNED: [],         // Final state
}

// Payment Status Flow
export const PAYMENT_STATUS_FLOW: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.ONLINE_PAYMENT_AWAITING]: [],
  [PaymentStatus.ONLINE_PAYMENT_PAID]: [PaymentStatus.REFUNDING],
  [PaymentStatus.COD]: [],
  [PaymentStatus.REFUNDING]: [PaymentStatus.REFUNDED],
  [PaymentStatus.REFUNDED]: [],
  [PaymentStatus.EXPIRED]: [],
}

/**
 * Get Vietnamese label for order status code
 */
export function getOrderStatusLabel(status: OrderStatus | number): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] || 'Không xác định'
}

/**
 * Get Vietnamese label for payment status code
 */
export function getPaymentStatusLabel(status: PaymentStatus | number): string {
  return PAYMENT_STATUS_LABELS[status as PaymentStatus] || 'Không xác định'
}

/**
 * Get color class for order status badge
 */
export function getOrderStatusColor(status: string | OrderStatus): string {
  const statusKey = typeof status === 'string' ? status.toUpperCase() : OrderStatus[status]
  
  switch (statusKey) {
    case 'CONFIRM_RECEIVED':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'ACCEPTED':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200'
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'PROCESSING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'PENDING':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'CANCELLED':
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'RETURNED':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'EXPIRED':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get color class for payment status badge
 */
export function getPaymentStatusColor(status: string | PaymentStatus): string {
  const statusKey = typeof status === 'string' ? status.toUpperCase() : PaymentStatus[status]
  
  switch (statusKey) {
    case 'ONLINE_PAYMENT_PAID':
    case 'COD':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'ONLINE_PAYMENT_AWAITING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'REFUNDING':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'REFUNDED':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Check if status transition is allowed
 */
export function isStatusTransitionAllowed(
  currentStatus: string,
  targetStatus: string
): boolean {
  const normalizedCurrent = currentStatus.toUpperCase().replace(/\s+/g, '_')
  const normalizedTarget = targetStatus.toUpperCase().replace(/\s+/g, '_')
  
  const allowedTargets = ORDER_STATUS_FLOW[normalizedCurrent as keyof typeof ORDER_STATUS_FLOW]
  return allowedTargets ? (allowedTargets as string[]).includes(normalizedTarget) : false
}

/**
 * Check if payment status transition is allowed
 */
export function isPaymentStatusTransitionAllowed(
  currentStatus: PaymentStatus,
  targetStatus: PaymentStatus
): boolean {
  const allowedTargets = PAYMENT_STATUS_FLOW[currentStatus as keyof typeof PAYMENT_STATUS_FLOW]
  return allowedTargets ? allowedTargets.includes(targetStatus) : false
}

/**
 * Get allowed next statuses for current order status
 */
export function getAllowedNextStatuses(currentStatus: string): string[] {
  const normalized = currentStatus.toUpperCase().replace(/\s+/g, '_')
  return ORDER_STATUS_FLOW[normalized as keyof typeof ORDER_STATUS_FLOW] || []
}

/**
 * Check if order status is final (cannot be changed)
 */
export function isFinalStatus(status: string): boolean {
  const normalized = status.toUpperCase().replace(/\s+/g, '_')
  const allowedNext = ORDER_STATUS_FLOW[normalized as keyof typeof ORDER_STATUS_FLOW]
  return !allowedNext || allowedNext.length === 0
}

/**
 * Parse status string to OrderStatus enum
 */
export function parseOrderStatus(status: string): OrderStatus {
  const normalized = status.toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_')
  
  switch (normalized) {
    case 'PENDING': return OrderStatus.PENDING
    case 'REJECTED': return OrderStatus.REJECTED
    case 'ACCEPTED': return OrderStatus.ACCEPTED
    case 'PROCESSING': return OrderStatus.PROCESSING
    case 'SHIPPED': return OrderStatus.SHIPPED
    case 'CONFIRM_RECEIVED': return OrderStatus.CONFIRM_RECEIVED
    case 'CANCELLED': return OrderStatus.CANCELLED
    case 'EXPIRED': return OrderStatus.EXPIRED
    case 'RETURNED': return OrderStatus.RETURNED
    default: return OrderStatus.PENDING
  }
}

/**
 * Parse payment status string to PaymentStatus enum
 */
export function parsePaymentStatus(status: string): PaymentStatus {
  const normalized = status.toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_')
  
  switch (normalized) {
    case 'ONLINE_PAYMENT_AWAITING': return PaymentStatus.ONLINE_PAYMENT_AWAITING
    case 'ONLINE_PAYMENT_PAID':
    case 'ONLINE_PAYMENT_COMPLETED': return PaymentStatus.ONLINE_PAYMENT_PAID
    case 'COD':
    case 'CASH_ON_DELIVERY': return PaymentStatus.COD
    case 'REFUNDING': return PaymentStatus.REFUNDING
    case 'REFUNDED': return PaymentStatus.REFUNDED
    case 'EXPIRED': return PaymentStatus.EXPIRED
    default: return PaymentStatus.ONLINE_PAYMENT_AWAITING
  }
}
