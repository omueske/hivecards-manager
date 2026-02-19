import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HiveModule } from './hives/hives.module';
import { ApiariesModule } from './apiaries/apiaries.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/hivecards'),
    AuthModule,
    HiveModule,
    ApiariesModule,
  ],
})
export class AppModule {}
