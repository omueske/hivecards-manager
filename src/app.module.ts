import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HiveModule } from './hives/hives.module';
import { ApiariesModule } from './apiaries/apiaries.module';
import { AuthModule } from './auth/auth.module';
import { InspectionsModule } from './inspections/inspections.module';
import { QueensModule } from './queens/queens.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/hivecards'),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'dist'),
      serveRoot: process.env.SERVE_ROOT || '/',
      exclude: ['/api*', '/api-docs*'],
    }),
    AuthModule,
    HiveModule,
    ApiariesModule,
    InspectionsModule,
    QueensModule,
  ],
})
export class AppModule {}
