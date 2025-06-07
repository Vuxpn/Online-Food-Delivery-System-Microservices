import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
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
  });
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3004);
}
bootstrap();
