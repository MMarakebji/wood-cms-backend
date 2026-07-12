import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  app.use(cookieParser());

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin:
      configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wood Products CMS API')
    .setDescription('Backend API documentation for the Wood Products CMS')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter the administrator access token',
      },
      'access-token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = Number(configService.get<string>('PORT') ?? 4000);

  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);

  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

void bootstrap();
