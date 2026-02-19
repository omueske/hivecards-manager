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

  // Stockkarte – Beute
  @Prop()
  hiveBoxType?: string; // z.B. Zander, Dadant, Langstroth

  @Prop({ default: 'Wirtschaftsvolk' })
  hiveType?: string; // Wirtschaftsvolk | Jungvolk | Ableger

  // Stockkarte – Königin
  @Prop()
  queenYear?: number; // Schlupfjahr

  @Prop()
  queenColor?: string; // Zeichenfarbe (Weiß/Gelb/Rot/Grün/Blau)

  @Prop()
  queenOrigin?: string; // Zucht | Schwarm | Ableger | Kauf

  @Prop()
  matingType?: string; // Standbegattet | Belegstelle | instrumentell

  @Prop({ default: false })
  queenMarked?: boolean;

  @Prop({ type: Array, default: [] })
  attachments?: Array<any>;

  /** @deprecated queen data moved to Queen collection – kept for migration detection only */
  @Prop()
  queenYear?: number;

  @Prop()
  queenColor?: string;

  @Prop()
  queenOrigin?: string;

  @Prop()
  matingType?: string;

  @Prop()
  queenMarked?: boolean;

  @Prop({ default: false })
  _queenMigrated?: boolean;
}

export const HiveSchema = SchemaFactory.createForClass(Hive);
