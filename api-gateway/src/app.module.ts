import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderModule } from './module/order/order.module';
import { ProductModule } from './module/product/product.module';
import { RolesGuard } from './guard/roles.guard';
import { WebSocketModule } from './module/websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.development'],
    }),

    AuthModule,
    OrderModule,
    ProductModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
