import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from 'src/dto/order.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import {
  EventPattern,
  Payload,
  Ctx,
  KafkaContext,
} from '@nestjs/microservices';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { WebSocketTrackingGateway } from '../websocket/websocket.gateway';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly webSocketGateway: WebSocketTrackingGateway,
  ) {}

  @ApiOperation({ summary: 'Create an order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiBody({ type: CreateOrderDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const userId = req.user.id;
    const result = await this.orderService.createOrder({
      ...createOrderDto,
      userId,
    });
    this.webSocketGateway.emitOrderEvent(userId, 'order_created', {
      orderId: result.orderId,
      status: 'PENDING',
      createdAt: new Date(),
      message: 'Đơn hàng đã được tạo thành công',
    });

    return result;
  }

  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':orderId/cancel')
  async cancelOrder(
    @Param('orderId') orderId: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    const result = await this.orderService.cancelOrder(orderId, userId, reason);

    this.webSocketGateway.emitOrderEvent(userId, 'order_cancelled', {
      orderId,
      status: 'CANCELLED',
      reason,
      cancelledAt: new Date(),
      message: 'Đơn hàng đã được hủy',
    });

    return result;
  }

  @ApiOperation({ summary: 'Get order history' })
  @ApiResponse({
    status: 200,
    description: 'Order history retrieved successfully',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getOrderHistory(@Request() req) {
    const userId = req.user.id;
    return await this.orderService.getOrderHistory(userId);
  }

  @ApiOperation({ summary: 'Get order details by ID (Buyer only)' })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
  })
  @ApiBearerAuth()
  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: string, @Request() req) {
    const userId = req.user.id;
    return await this.orderService.getOrderById(orderId, userId);
  }

  @ApiOperation({
    summary: 'Get orders containing seller products (Seller only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Seller orders retrieved successfully',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @Get('seller/orders')
  async getSellerOrders(@Request() req) {
    const sellerId = req.user.id;
    return await this.orderService.getSellerOrders(sellerId);
  }

  @ApiOperation({ summary: 'Update order status (Seller only)' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @Put(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
    @Request() req,
  ) {
    const sellerId = req.user.id;
    return await this.orderService.updateOrderStatus(orderId, sellerId, status);
  }

  @EventPattern('order.status_updated')
  async handleOrderStatusUpdated(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received order.status_updated event:', message);

    const { orderId, userId, newStatus, updatedAt } = message;

    const statusMessages = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang chuẩn bị',
      SHIPPED: 'Đang giao hàng',
      DELIVERED: 'Đã giao hàng',
      CANCELLED: 'Đã hủy',
    };

    this.webSocketGateway.emitOrderStatusUpdate(userId, {
      orderId,
      status: newStatus,
      statusText: statusMessages[newStatus] || newStatus,
      updatedAt,
      message: `Đơn hàng ${statusMessages[newStatus]?.toLowerCase() || newStatus}`,
    });

    return message;
  }

  @EventPattern('order.delivered')
  async handleOrderDelivered(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    try {
      const { orderId, userId, deliveredAt } = message;
      this.webSocketGateway.emitOrderEvent(userId, 'order_delivered', {
        orderId,
        status: 'DELIVERED',
        deliveredAt,
        message:
          'Đơn hàng đã được giao thành công! Cảm ơn bạn đã sử dụng dịch vụ.',
      });
    } catch (error) {
      console.error('Error handling order.delivered event:', error);
      throw error;
    }
  }
}
