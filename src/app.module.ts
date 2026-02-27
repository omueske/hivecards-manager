import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HiveModule } from './hives/hives.module';
import { ApiariesModule } from './apiaries/apiaries.module';
import { AuthModule } from './auth/auth.module';
import { InspectionsModule } from './inspections/inspections.module';
import { QueensModule } from './queens/queens.module';
import { TreatmentAgentsModule } from './treatment-agents/treatment-agents.module';
import { BreedingBookModule } from './breeding-book/breeding-book.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/hivecards'),
    AuthModule,
    HiveModule,
    ApiariesModule,
    InspectionsModule,
    QueensModule,
    TreatmentAgentsModule,
    BreedingBookModule,
  ],
})
export class AppModule {}
