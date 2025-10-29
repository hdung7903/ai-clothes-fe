// Admin and Dashboard related types

export interface DashboardData {
  totalUser: number;
  totalProduct: number;
  totalPendingOrder: number;
  totalAcceptedOrder: number;
  totalProcessingOrder: number;
  totalShippedOrder: number;
  totalConfirmReceived: number;
}

export interface RevenueStatisticsDataPoint {
  date: string;
  revenue: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalOrder: number;
  totalQuantity: number;
}

export type OrderType = 'ALL' | 'ONLINE' | 'COD';