import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
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

  // Serve frontend/dist as Express static middleware.
  // Runs BEFORE NestJS route handlers → assets are served correctly.
  const distPath = join(__dirname, '..', 'frontend', 'dist');
  const serveRoot = (process.env.SERVE_ROOT || '').replace(/\/+$/, ''); // e.g. '/hivecards-manager'

  if (existsSync(distPath)) {
    // Serve all static files under the subpath
    app.use(serveRoot + '/', express.static(distPath));

    // SPA fallback: non-API GET requests without file extension → index.html
    app.use((req: any, res: any, next: any) => {
      const p: string = req.path;
      if (
        req.method !== 'GET' ||
        p.startsWith('/api') ||
        p.startsWith('/api-docs') ||
        /\.[a-zA-Z0-9]+$/.test(p)
      ) {
        return next();
      }
      res.sendFile(join(distPath, 'index.html'));
    });

    logger.log('Serving frontend from ' + distPath + ' at "' + (serveRoot || '/') + '"');
  } else {
    logger.warn('Frontend dist not found at ' + distPath + ' – run npm run build:frontend first');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Server listening on http://localhost:${port}`);
}

bootstrap();
