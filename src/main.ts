import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const config = new DocumentBuilder()
    .setTitle('Hivecards Manager API')
    .setDescription('Auto-generated API docs (MVP)')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // write openapi json for consumers
  try {
    writeFileSync('doc/openapi-generated.json', JSON.stringify(document, null, 2));
    logger.log('Wrote OpenAPI document to doc/openapi-generated.json');
  } catch (e) {
    logger.warn('Could not write OpenAPI document to disk (readonly?)');
  }

  // trust reverse proxy (nginx etc.) so scheme/IP forwarding works
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // CORS: in production configure CORS_ORIGIN in .env (comma-separated)
  // In production the frontend is served from the same origin, so same-origin
  // requests need no CORS – but the env var handles cases where proxy changes the origin.
  const corsOriginEnv = process.env.CORS_ORIGIN;
  const corsOrigins: (string | RegExp)[] = corsOriginEnv
    ? corsOriginEnv.split(',').map((o) => o.trim())
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:4173',
        'http://localhost:3000',
      ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: 'Authorization,Content-Type',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  logger.log(`CORS allowed origins: ${JSON.stringify(corsOrigins)}`);

  // enable cookie parser so controllers can read httpOnly refresh cookie
  app.use(cookieParser());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Server listening on http://localhost:${port}`);
}

bootstrap();
