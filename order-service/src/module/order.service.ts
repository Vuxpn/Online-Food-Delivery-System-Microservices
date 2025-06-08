import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { Order } from '../interface/order.interface';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('ORDER_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async processNewOrder(orderData: Order) {
    try {
      await this.validateOrder(orderData);
      const savedOrder = await this.saveOrder(orderData);

      this.kafkaClient.emit('order.confirmed', {
        key: orderData.userId,
        value: {
          orderId: orderData.orderId,
          userId: orderData.userId,
          items: orderData.items,
          confirmedAt: new Date(),
        },
      });

      console.log(`Order ${orderData.orderId} processed successfully`);
      return savedOrder;
    } catch (error) {
      console.error(`Error processing order ${orderData.orderId}:`, error);
      throw error;
    }
  }

  async cancelOrder(cancelData: any) {
    try {
      const { orderId } = cancelData;

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      });

      console.log(`Order ${orderId} cancelled`);
    } catch (error) {
      console.error(`Error cancelling order:`, error);
    }
  }

  async completeOrder(deliveryData: any) {
    try {
      const { orderId } = deliveryData;

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'DELIVERED',
          updatedAt: new Date(),
        },
      });

      console.log(`Order ${orderId} completed`);
    } catch (error) {
      console.error(`Error completing order:`, error);
    }
  }

  private async validateOrder(orderData: Order) {
    if (!orderData.orderId || !orderData.userId) {
      throw new Error('Invalid order data');
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must have at least one product');
    }

    const calculatedTotal = orderData.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    if (Math.abs(calculatedTotal - orderData.totalAmount) > 0.01) {
      throw new Error('Total amount does not match');
    }
  }

  private async saveOrder(orderData: Order) {
    const order = await this.prisma.order.create({
      data: {
        id: orderData.orderId,
        userId: orderData.userId,
        shippingAddress: orderData.shippingAddress,
        totalAmount: orderData.totalAmount,
        status: 'CONFIRMED',
        note: orderData.note,
        createdAt: new Date(orderData.createdAt),
        items: {
          create: orderData.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return order;
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: status as any,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Error updating order status ${orderId}:`, error);
    }
  }

  async getOrderById(orderId: string) {
    return await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
  }

  async getOrderByIdAndUserId(orderId: string, userId: string) {
    try {
      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId: userId,
        },
        include: { items: true },
      });

      if (!order) {
        return null;
      }

      return {
        orderId: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        shippingAddress: order.shippingAddress,
        note: order.note,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        itemCount: order.items.length,
        items: order.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.price),
          totalPrice: Number(item.price) * item.quantity,
        })),
      };
    } catch (error) {
      console.error(
        `Error getting order ${orderId} for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  async getOrdersByUserId(userId: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: { userId },
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const orderHistory = orders.map((order) => ({
        orderId: order.id,
        userId: order.userId,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        shippingAddress: order.shippingAddress,
        note: order.note,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        itemCount: order.items.length,

        itemsSummary: order.items.slice(0, 3).map((item) => ({
          name: item.name,
          quantity: item.quantity,
        })),

        hasMoreItems: order.items.length > 3,
      }));

      console.log(`Retrieved ${orderHistory.length} orders for user ${userId}`);
      return orderHistory;
    } catch (error) {
      console.error(`Error getting orders for user ${userId}:`, error);
      throw error;
    }
  }

  // async getOrdersBySeller(sellerId: string) {
  //   try {
  //     const orders = await this.prisma.order.findMany({
  //       where: { items: { some: { sellerId } } },
  //     });
  //   } catch (error) {
  //     console.error(`Error getting orders for seller ${sellerId}:`, error);
  //     throw error;
  //   }
  // }
}
