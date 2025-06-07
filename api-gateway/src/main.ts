import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import * as dotenv from 'dotenv';
import { Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-service',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'auth-service-consumer',
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

  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Api documents for Auth Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Auth Service is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
