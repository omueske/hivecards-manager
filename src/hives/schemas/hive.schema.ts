import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HiveDocument = Hive & Document;

@Schema({ timestamps: true })
export class Hive {
  @Prop({ required: true })
  apiaryId!: string;

  @Prop({ required: true })
  hiveNumber!: string;

  @Prop({ default: 'active' })
  status!: string;

  createdAt?: Date;
  updatedAt?: Date;

  @Prop()
  frameCount?: number;

  @Prop()
  installationDate?: string;

  @Prop()
  notes?: string;

  @Prop({ type: Array, default: [] })
  attachments?: Array<any>;
}

export const HiveSchema = SchemaFactory.createForClass(Hive);
