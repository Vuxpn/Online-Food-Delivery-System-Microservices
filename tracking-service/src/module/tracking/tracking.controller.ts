import { Controller } from '@nestjs/common';
import {
  Payload,
  Ctx,
  KafkaContext,
  EventPattern,
} from '@nestjs/microservices';
import { TrackingService } from './tracking.service';

@Controller()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @EventPattern('order.confirmed')
  async handleOrderConfirmed(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received order.confirmed event:', message);
    return await this.trackingService.startTracking(message);
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Received order.cancelled event:', message);
    return await this.trackingService.cancelTracking(message);
  }
}
