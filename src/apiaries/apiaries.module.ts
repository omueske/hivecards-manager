import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiariesService } from './apiaries.service';
import { ApiariesController } from './apiaries.controller';
import { Apiary, ApiarySchema } from './schemas/apiary.schema';
import { AuthModule } from '../auth/auth.module';
import { JwtGuard } from '../common/jwt.guard';
import { Hive, HiveSchema } from '../hives/schemas/hive.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Apiary.name, schema: ApiarySchema },
      { name: Hive.name, schema: HiveSchema },
    ]),
    AuthModule,
  ],
  controllers: [ApiariesController],
  providers: [ApiariesService, JwtGuard],
  exports: [ApiariesService],
})
export class ApiariesModule {}
