import { Body, Controller, Post } from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  Payload,
  Ctx,
  KafkaContext,
} from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import { ProductCreatedEvent } from '../../interface/product.interface';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern('product.created')
  async handleProductCreated(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received product.created event:', message);
    return await this.inventoryService.createProduct(message);
  }

  @EventPattern('product.updated')
  async handleProductUpdated(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received product.updated event:', message);
    return await this.inventoryService.updateProduct(message);
  }

  @EventPattern('product.deleted')
  async handleProductDeleted(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received product.deleted event:', message);
    return await this.inventoryService.deleteProduct(message);
  }

  @MessagePattern('get.allproducts')
  async getAllProducts() {
    return await this.inventoryService.getProducts();
  }

  @MessagePattern('get.productsbyuser')
  async getProductsByUser(@Payload() message: any) {
    return await this.inventoryService.getProductsByUser(message.userId);
  }

  @MessagePattern('get.productbyid')
  async getProductById(@Payload() message: any) {
    return await this.inventoryService.getProductById(message.productId);
  }

  @EventPattern('order.delivered')
  async handleOrderDelivered(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received order.delivered event:', message);
    return await this.inventoryService.updateInventoryAfterDelivery(message);
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received order.cancelled event:', message);
    return await this.inventoryService.handleOrderCancelled(message);
  }

  @Post('test')
  async test(@Body() body: ProductCreatedEvent) {
    return await this.inventoryService.createProduct(body);
  }
}
