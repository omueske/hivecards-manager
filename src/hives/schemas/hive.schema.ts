import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

export type HiveDocument = Hive & Document;

@Schema({ timestamps: true })
export class Hive {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Apiary', required: false })
  apiaryId?: Types.ObjectId | string;

  @Prop({ required: true, index: true })
  userId!: string;

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
