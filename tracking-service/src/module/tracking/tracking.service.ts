import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ORDER_STATUSES } from '../../interface/tracking.interface';

@Injectable()
export class TrackingService {
  private trackingTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    @Inject('TRACKING_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async startTracking(orderData: any) {
    try {
      const { orderId, userId } = orderData;

      console.log(`Start tracking order ${orderId}`);
      this.kafkaClient.emit('order.status_updated', {
        key: userId,
        value: {
          orderId,
          userId,
          startedAt: new Date(),
        },
      });

      this.simulateOrderProcess(orderData);
    } catch (error) {
      console.error('Error starting tracking:', error);
    }
  }

  private simulateOrderProcess(orderData: any) {
    const { orderId, userId } = orderData;

    const processingTimer = setTimeout(() => {
      this.updateOrderStatus(orderId, userId, ORDER_STATUSES.PROCESSING);

      const shippedTimer = setTimeout(() => {
        this.updateOrderStatus(orderId, userId, ORDER_STATUSES.SHIPPED);

        const deliveredTimer = setTimeout(() => {
          this.updateOrderStatus(orderId, userId, ORDER_STATUSES.DELIVERED);
          this.completeOrder(orderData);

          this.trackingTimers.delete(orderId);
        }, 10000);

        this.trackingTimers.set(`${orderId}_delivered`, deliveredTimer);
      }, 10000);
      this.trackingTimers.set(`${orderId}_shipped`, shippedTimer);
    }, 10000);

    this.trackingTimers.set(`${orderId}_processing`, processingTimer);
  }

  private updateOrderStatus(
    orderId: string,
    userId: string,
    newStatus: string,
  ) {
    console.log(`Update order status ${orderId}: ${newStatus}`);

    this.kafkaClient.emit('order.status_updated', {
      key: userId,
      value: {
        orderId,
        userId,
        newStatus,
        updatedAt: new Date(),
      },
    });
  }

  private completeOrder(orderData: any) {
    const { orderId, userId } = orderData;

    console.log(`Complete order ${orderId}`);

    this.kafkaClient.emit('order.delivered', {
      key: userId,
      value: {
        orderId,
        userId,
        items: orderData.items,
        deliveredAt: new Date(),
      },
    });
  }

  async cancelTracking(cancelData: any) {
    try {
      const { orderId } = cancelData;

      const timersToCancel = [];
      for (const [key, timer] of this.trackingTimers.entries()) {
        if (key.startsWith(orderId)) {
          clearTimeout(timer);
          timersToCancel.push(key as never);
        }
      }

      timersToCancel.forEach((key) => this.trackingTimers.delete(key));

      console.log(`Cancel tracking for order ${orderId}`);
    } catch (error) {
      console.error('Error canceling tracking:', error);
    }
  }
}
