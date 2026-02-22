import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TreatmentAgentsService } from './treatment-agents.service';
import { TreatmentAgentsController } from './treatment-agents.controller';
import { TreatmentAgent, TreatmentAgentSchema } from './schemas/treatment-agent.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TreatmentAgent.name, schema: TreatmentAgentSchema },
    ]),
    AuthModule,
  ],
  providers: [TreatmentAgentsService],
  controllers: [TreatmentAgentsController],
})
export class TreatmentAgentsModule {}
