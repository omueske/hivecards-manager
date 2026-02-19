import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';
import { Inspection, InspectionSchema } from './schemas/inspection.schema';
import { AuthModule } from '../auth/auth.module';
import { JwtGuard } from '../common/jwt.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Inspection.name, schema: InspectionSchema }]),
    AuthModule,
  ],
  controllers: [InspectionsController],
  providers: [InspectionsService, JwtGuard],
})
export class InspectionsModule {}
