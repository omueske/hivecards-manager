import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QueenDocument = Queen & Document;

export class HiveHistoryEntry {
  hiveId!: string;
  from!: Date;
  to?: Date;
}

@Schema({ timestamps: true })
export class Queen {
  @Prop({ required: true, index: true })
  userId!: string;

  /** Optional human-readable label, e.g. "K2024-A" */
  @Prop()
  name?: string;

  @Prop()
  queenYear?: number;

  @Prop()
  queenColor?: string;

  @Prop()
  queenOrigin?: string;

  @Prop()
  matingType?: string;

  @Prop({ default: false })
  queenMarked!: boolean;

  /**
   * Status of the queen:
   *   active  – currently in a hive
   *   spare   – no hive, available
   *   dead    – deceased
   *   sold    – sold / given away
   */
  @Prop({ default: 'spare' })
  status!: string;

  @Prop()
  notes?: string;

  /**
   * Full history of hive assignments.
   * The current hive is the entry where `to` is null/undefined.
   */
  @Prop({
    type: [
      {
        hiveId: { type: String, required: true },
        from: { type: Date, required: true },
        to: { type: Date, required: false },
      },
    ],
    default: [],
  })
  hiveHistory!: HiveHistoryEntry[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const QueenSchema = SchemaFactory.createForClass(Queen);
