import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TRACKING_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'tracking-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'tracking-service-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
