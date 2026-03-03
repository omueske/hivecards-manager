import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { BestandsbuchController } from './bestandsbuch.controller';
import { BestandsbuchService } from './bestandsbuch.service';
import { BestandsbuchEntry, BestandsbuchEntrySchema } from './schemas/bestandsbuch-entry.schema';
import { Hive, HiveSchema } from '../hives/schemas/hive.schema';
import { Apiary, ApiarySchema } from '../apiaries/schemas/apiary.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Inspection, InspectionSchema } from '../inspections/schemas/inspection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BestandsbuchEntry.name, schema: BestandsbuchEntrySchema },
      { name: Hive.name, schema: HiveSchema },
      { name: Apiary.name, schema: ApiarySchema },
      { name: User.name, schema: UserSchema },
      { name: Inspection.name, schema: InspectionSchema },
    ]),
    AuthModule,
  ],
  controllers: [BestandsbuchController],
  providers: [BestandsbuchService],
  exports: [BestandsbuchService],
})
export class BestandsbuchModule {}
