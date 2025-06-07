import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INVENTORY_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'inventory-service',
            brokers: ['localhost:9092'],
          },
        },
      },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, PrismaService],
})
export class InventoryModule {}
