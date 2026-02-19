import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HiveService } from './hives.service';
import { HiveController } from './hives.controller';
import { JwtGuard } from '../common/jwt.guard';
import { Hive, HiveSchema } from './schemas/hive.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Hive.name, schema: HiveSchema }]), AuthModule],
  controllers: [HiveController],
  providers: [HiveService, JwtGuard],
})
export class HiveModule {}
