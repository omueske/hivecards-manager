import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InspectionDocument = Inspection & Document;

export type InspectionType =
  | 'inspection'   // Durchsicht
  | 'treatment'    // Varroabehandlung
  | 'feeding'      // Fütterung
  | 'harvest'      // Honigernte
  | 'note';        // Notiz (allgemein)

@Schema({ timestamps: true })
export class Inspection {
  @Prop({ type: Types.ObjectId, ref: 'Hive', required: true, index: true })
  hiveId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  userId!: string;

  /** ISO date string (YYYY-MM-DD) */
  @Prop({ required: true })
  date!: string;

  @Prop({ default: 'note' })
  type!: string;

  /** Freitext / allgemeine Notiz */
  @Prop()
  notes?: string;

  /** Königin gesehen? */
  @Prop()
  queenSeen?: boolean;

  /** Brutstatus (z.B. „lückenhaft", „gut") */
  @Prop()
  broodStatus?: string;

  /** Varroa-Milben pro Tag (natürlicher Abfall) */
  @Prop()
  varroaCount?: number;

  /** Durchgeführte Maßnahmen */
  @Prop()
  actionsTaken?: string;

  /** Rähmchenzahl bei diesem Kontrolldatum */
  @Prop()
  frameCount?: number;

  /** Wetterbedingungen */
  @Prop()
  weather?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const InspectionSchema = SchemaFactory.createForClass(Inspection);
