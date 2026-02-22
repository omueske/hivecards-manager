import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TreatmentAgentDocument = TreatmentAgent & Document;

@Schema({ timestamps: true })
export class TreatmentAgent {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: 'treatment' })
  category!: string;
}

export const TreatmentAgentSchema = SchemaFactory.createForClass(TreatmentAgent);

// Prevent duplicates per user+category
TreatmentAgentSchema.index({ userId: 1, category: 1, name: 1 }, { unique: true });
