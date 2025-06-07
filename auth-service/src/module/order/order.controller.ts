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

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({ summary: 'Create an order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiBody({ type: CreateOrderDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const userId = req.user.id;
    return await this.orderService.createOrder({
      ...createOrderDto,
      userId,
    });
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
    return await this.orderService.cancelOrder(orderId, userId, reason);
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

  @EventPattern('order.status_updated')
  async handleOrderStatusUpdated(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received order.status_updated event:', message);
  }
}
