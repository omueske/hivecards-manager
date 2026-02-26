import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { AdminController } from './admin.controller';
import { User, UserSchema } from './schemas/user.schema';
import { MailModule } from '../mail/mail.module';
import { Apiary, ApiarySchema } from '../apiaries/schemas/apiary.schema';
import { Hive, HiveSchema } from '../hives/schemas/hive.schema';
import { Queen, QueenSchema } from '../queens/schemas/queen.schema';
import { Inspection, InspectionSchema } from '../inspections/schemas/inspection.schema';
import {
  TreatmentAgent,
  TreatmentAgentSchema,
} from '../treatment-agents/schemas/treatment-agent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Apiary.name, schema: ApiarySchema },
      { name: Hive.name, schema: HiveSchema },
      { name: Queen.name, schema: QueenSchema },
      { name: Inspection.name, schema: InspectionSchema },
      { name: TreatmentAgent.name, schema: TreatmentAgentSchema },
    ]),
    MailModule,
  ],
  providers: [AuthService],
  controllers: [AuthController, UsersController, AdminController],
  exports: [AuthService],
})
export class AuthModule {}
