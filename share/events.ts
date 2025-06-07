export interface BaseEvent {
    eventId: string;
    eventType: string;
    aggregateId: string;
    timestamp: Date;
    version: number;
    userId?: string;
}

export interface UserRegisteredEvent extends BaseEvent {
    eventType: 'USER_REGISTERED';
    data: {
        userId: string;
        email: string;
        username: string;
        name?: string;
    };
}

export interface UserLoggedInEvent extends BaseEvent {
    eventType: 'USER_LOGGED_IN';
    data: {
        userId: string;
        email: string;
        username: string;
        loginAt: Date;
    };
}

export interface OrderCreatedEvent extends BaseEvent {
    eventType: 'ORDER_CREATED';
    data: {
        orderId: string;
        userId: string;
        items: Array<{
            productId: string;
            quantity: number;
            price: number;
        }>;
        totalAmount: number;
        shippingAddress: string;
        note?: string;
        status: 'PENDING';
        createdAt: string;
    };
}

export interface OrderConfirmedEvent extends BaseEvent {
    eventType: 'ORDER_CONFIRMED';
    data: {
        orderId: string;
        userId: string;
        confirmedAt: Date;
    };
}

export interface OrderCancelledEvent extends BaseEvent {
    eventType: 'ORDER_CANCELLED';
    data: {
        orderId: string;
        userId: string;
        reason: string;
        cancelledAt: Date;
    };
}

export interface ProductCreatedEvent extends BaseEvent {
    eventType: 'PRODUCT_CREATED';
    data: {
        productId: string;
        name: string;
        description?: string;
        price: number;
        quantity: number;
        category?: string;
        createdBy: string;
    };
}

export interface OrderStatusUpdatedEvent extends BaseEvent {
    eventType: 'ORDER_STATUS_UPDATED';
    data: {
        orderId: string;
        userId: string;
        oldStatus: string;
        newStatus: string;
        updatedAt: Date;
    };
}

export interface OrderTrackingStartedEvent extends BaseEvent {
    eventType: 'ORDER_TRACKING_STARTED';
    data: {
        orderId: string;
        userId: string;
        startedAt: Date;
    };
}

export interface OrderDeliveredEvent extends BaseEvent {
    eventType: 'ORDER_DELIVERED';
    data: {
        orderId: string;
        userId: string;
        deliveredAt: Date;
    };
}

export interface InventoryUpdatedEvent extends BaseEvent {
    eventType: 'INVENTORY_UPDATED';
    data: {
        productId: string;
        oldQuantity: number;
        newQuantity: number;
        reason: string;
        orderId?: string;
    };
}

export interface InventoryReservedEvent extends BaseEvent {
    eventType: 'INVENTORY_RESERVED';
    data: {
        productId: string;
        quantity: number;
        orderId: string;
        reservedAt: Date;
    };
}

export interface InventoryReleasedEvent extends BaseEvent {
    eventType: 'INVENTORY_RELEASED';
    data: {
        productId: string;
        quantity: number;
        orderId: string;
        releasedAt: Date;
    };
}

export type Event =
    | UserRegisteredEvent
    | UserLoggedInEvent
    | OrderCreatedEvent
    | OrderConfirmedEvent
    | OrderCancelledEvent
    | ProductCreatedEvent
    | OrderStatusUpdatedEvent
    | OrderTrackingStartedEvent
    | OrderDeliveredEvent
    | InventoryUpdatedEvent
    | InventoryReservedEvent
    | InventoryReleasedEvent;

export const KAFKA_TOPICS = {
    USER_REGISTERED: 'user.registered',
    USER_LOGGED_IN: 'user.logged_in',
    ORDER_CREATED: 'order.created',
    ORDER_CONFIRMED: 'order.confirmed',
    ORDER_CANCELLED: 'order.cancelled',
    PRODUCT_CREATED: 'product.created',
    ORDER_STATUS_UPDATED: 'order.status_updated',
    ORDER_TRACKING_STARTED: 'order.tracking_started',
    ORDER_DELIVERED: 'order.delivered',
    INVENTORY_UPDATED: 'inventory.updated',
    INVENTORY_RESERVED: 'inventory.reserved',
    INVENTORY_RELEASED: 'inventory.released',
};
