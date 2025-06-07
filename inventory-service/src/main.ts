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
        clientId: 'inventory-service',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'inventory-service-consumer',
      },
    },
  });

  await app.startAllMicroservices();

  dotenv.config({
    path:
      process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Inventory service is running on port ${port}`);
}
bootstrap();
