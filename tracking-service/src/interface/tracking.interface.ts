export interface OrderTrackingData {
  orderId: string;
  userId: string;
  currentStatus: string;
  trackingHistory: TrackingStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackingStep {
  status: string;
  timestamp: Date;
  description: string;
}

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;
