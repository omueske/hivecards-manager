import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

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
  } catch (e) {
    // ignore write errors in environments where filesystem is readonly
  }

  // enable CORS for local dev (frontend dev server origins)
  app.enableCors({ origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:4173',
    'http://localhost:3000'
  ], credentials: true });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server listening on http://localhost:${port}`);
}

bootstrap();
