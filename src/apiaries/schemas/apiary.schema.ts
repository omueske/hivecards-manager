import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApiaryDocument = Apiary & Document;

@Schema({ timestamps: true })
export class Apiary {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop()
  description?: string;

  @Prop()
  color?: string;
}

export const ApiarySchema = SchemaFactory.createForClass(Apiary);
