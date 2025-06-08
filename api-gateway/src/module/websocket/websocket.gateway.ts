import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:000', 'http://localhost:5173'],
    credentials: true,
  },
  namespace: '/tracking',
})
export class WebSocketTrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketTrackingGateway.name);
  private userSockets = new Map<string, Socket[]>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        this.logger.error('No token provided');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)!.push(client);

      client.data = { userId };

      this.logger.log(`User ${userId} connected to tracking`);

      client.join(`user:${userId}`);

      client.emit('connected', { message: 'Connected to order tracking' });
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;
    if (userId) {
      const userSocketList = this.userSockets.get(userId);
      if (userSocketList) {
        const index = userSocketList.indexOf(client);
        if (index > -1) {
          userSocketList.splice(index, 1);
        }
        if (userSocketList.length === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.logger.log(`User ${userId} disconnected from tracking`);
    }
  }

  @SubscribeMessage('subscribe_order')
  handleSubscribeOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { orderId } = data;
    const userId = client.data?.userId;

    if (!userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    client.join(`order:${orderId}`);
    this.logger.log(`User ${userId} subscribed to order ${orderId}`);

    client.emit('subscribed', {
      orderId,
      message: 'Subscribed to order updates',
    });
  }

  @SubscribeMessage('unsubscribe_order')
  handleUnsubscribeOrder(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { orderId } = data;
    const userId = client.data?.userId;

    client.leave(`order:${orderId}`);
    this.logger.log(`User ${userId} unsubscribed from order ${orderId}`);

    client.emit('unsubscribed', { orderId });
  }

  emitOrderStatusUpdate(userId: string, orderData: any) {
    this.server.to(`user:${userId}`).emit('order_status_updated', orderData);

    this.server
      .to(`order:${orderData.orderId}`)
      .emit('order_status_updated', orderData);

    this.logger.log(
      `Emitted order update for ${orderData.orderId} to user ${userId}`,
    );
  }

  emitOrderEvent(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);

    if (data.orderId) {
      this.server.to(`order:${data.orderId}`).emit(event, data);
    }

    this.logger.log(`Emitted ${event} to user ${userId}`);
  }
}
