import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateOrderDto } from 'src/dto/order.dto';
import { v4 as uuidv4 } from 'uuid';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {
    this.kafkaClient.subscribeToResponseOf('get.orderhistory');
    this.kafkaClient.subscribeToResponseOf('get.orderbyid');
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    try {
      const orderId = uuidv4();
      const orderData = {
        orderId,
        ...createOrderDto,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      this.kafkaClient.emit('order.created', {
        key: createOrderDto.userId,
        value: orderData,
      });
      return {
        message: 'Order created successfully',
        orderId,
        status: 'PENDING',
        createdAt: orderData.createdAt,
      };
    } catch (error) {
      throw new Error('Failed to create order');
    }
  }

  async cancelOrder(orderId: string, userId: string, reason: string) {
    try {
      const cancelData = {
        orderId,
        userId,
        reason,
        cancelledAt: new Date(),
      };

      this.kafkaClient.emit('order.cancelled', {
        key: userId,
        value: cancelData,
      });

      return {
        message: 'Order cancelled successfully',
        orderId,
        status: 'CANCELLED',
        cancelledAt: cancelData.cancelledAt,
      };
    } catch (error) {
      throw new Error('Cannot cancel order');
    }
  }

  async getOrderHistory(userId: string) {
    try {
      const response = await lastValueFrom(
        this.kafkaClient.send('get.orderhistory', { userId }),
      ).catch(() => null);

      return {
        message: 'Order history retrieved successfully',
        orders: response || [],
      };
    } catch (error) {
      throw new HttpException(
        'Cannot get order history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getOrderById(orderId: string, userId: string) {
    try {
      const response = await lastValueFrom(
        this.kafkaClient.send('get.orderbyid', { orderId, userId }),
      ).catch(() => null);

      if (!response) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      return {
        message: 'Order details retrieved successfully',
        order: response,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Cannot get order details',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
