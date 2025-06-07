export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  note?: string;
  shippingAddress: string;
  totalAmount: number;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';
  createdAt: string;
  updatedAt?: string;
}

export interface OrderCreatedEvent {
  eventType: 'ORDER_CREATED';
  timestamp: string;
  data: Order;
}
