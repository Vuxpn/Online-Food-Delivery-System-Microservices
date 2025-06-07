import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'order-service',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'order-service-consumer',
      },
    },
  });

  dotenv.config({
    path:
      process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development',
  });

  await app.startAllMicroservices();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
