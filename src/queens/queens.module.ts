import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Queen, QueenSchema } from './schemas/queen.schema';
import { Hive, HiveSchema } from '../hives/schemas/hive.schema';
import { QueensService } from './queens.service';
import { QueensController } from './queens.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Queen.name, schema: QueenSchema },
      { name: Hive.name, schema: HiveSchema },
    ]),
    AuthModule,
  ],
  providers: [QueensService],
  controllers: [QueensController],
  exports: [QueensService],
})
export class QueensModule {}
