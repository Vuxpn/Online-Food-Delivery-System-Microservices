import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  KafkaContext,
  EventPattern,
} from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @EventPattern('order.created')
  async handleOrderCreated(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received order.created event:', message);
    return await this.orderService.processNewOrder(message);
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received order.cancelled event:', message);
    return await this.orderService.cancelOrder(message);
  }

  @EventPattern('order.delivered')
  async handleOrderDelivered(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received order.delivered event:', message);
    return await this.orderService.completeOrder(message);
  }

  @MessagePattern('get.orderhistory')
  async getOrderHistory(@Payload() message: any) {
    console.log('Received get.orderhistory event:', message);
    return await this.orderService.getOrdersByUserId(message.userId);
  }

  @MessagePattern('get.orderbyid')
  async getOrderById(@Payload() message: any) {
    console.log('Received get.orderbyid request:', message);
    return await this.orderService.getOrderByIdAndUserId(
      message.orderId,
      message.userId,
    );
  }

  // @MessagePattern('get.seller.orders')
  // async getSellerOrders(@Payload() message: any) {
  //   console.log('Received get.seller.orders request:', message);
  //   return await this.orderService.getOrdersBySeller(message.sellerId);
  // }

  @EventPattern('order.status_updated')
  async handleOrderStatusUpdated(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received order.status.updated event:', message);
    return await this.orderService.updateOrderStatus(
      message.orderId,
      message.status,
    );
  }
}
