import { NestFactory, NestExpressApplication } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { raw } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Raw body middleware for webhooks (before body parser)
  app.use('/webhooks', raw({ type: 'application/json' }));

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('PropIntel API')
    .setDescription('AI Real Estate Investment Intelligence API with Stripe billing integration')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer(process.env.API_URL || 'http://localhost:3001', 'Development')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Subscriptions', 'Billing & subscriptions (Stripe integrated)')
    .addTag('Listings', 'Property listings')
    .addTag('Scoring', 'Deal scoring & analysis')
    .addTag('Reports', 'PDF report generation')
    .addTag('Alerts', 'User alerts & notifications')
    .addTag('Health', 'Health check endpoints')
    .addTag('Webhooks', 'Stripe webhook handlers')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`✅ PropIntel API running on port ${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
