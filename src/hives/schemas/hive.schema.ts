import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

export type HiveDocument = Hive & Document;

@Schema({ timestamps: true })
export class Hive {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Apiary', required: true, index: true })
  apiaryId!: Types.ObjectId | string;

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

  // Stockkarte – Beute
  @Prop()
  hiveBoxType?: string; // z.B. Zander, Dadant, Langstroth

  @Prop({ default: 'Wirtschaftsvolk' })
  hiveType?: string; // Wirtschaftsvolk | Jungvolk | Ableger

  // Stockkarte – Königin (@deprecated – moved to Queen collection, kept for migration)
  /** @deprecated queen data moved to Queen collection */
  @Prop()
  queenYear?: number;

  /** @deprecated */
  @Prop()
  queenColor?: string;

  /** @deprecated */
  @Prop()
  queenOrigin?: string;

  /** @deprecated */
  @Prop()
  matingType?: string;

  /** @deprecated */
  @Prop({ default: false })
  queenMarked?: boolean;

  @Prop({ type: Array, default: [] })
  attachments?: Array<any>;

  @Prop({ default: false })
  _queenMigrated?: boolean;
}

export const HiveSchema = SchemaFactory.createForClass(Hive);
