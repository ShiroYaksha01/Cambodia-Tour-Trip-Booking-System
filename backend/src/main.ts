import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

   app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Enable CORS
  app.enableCors({
    origin: '*', // Replace '*' with your frontend URL for better security
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });


  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}
bootstrap();
