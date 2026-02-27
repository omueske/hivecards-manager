import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BreedingBookEntryDocument = BreedingBookEntry & Document;

export class MiteSample {
  nr?: number;
  value?: number;
  gramm?: number;
  days?: number;
  dateRaw?: string;
}

@Schema({ timestamps: true })
export class BreedingBookEntry {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ index: true })
  queenId?: string;

  @Prop({ index: true })
  hiveId?: string;

  @Prop({ index: true })
  code1a?: string;

  @Prop()
  l1a?: string;

  @Prop()
  lv1a?: number;

  @Prop()
  z1a?: number;

  @Prop()
  nr1a?: number;

  @Prop()
  j1a?: number;

  @Prop()
  nst?: number;

  @Prop()
  anpaarTyp?: number;

  @Prop()
  paarTyp?: number;

  @Prop()
  line?: string;

  @Prop()
  entryDate?: string;

  @Prop()
  notes?: string;

  @Prop({ enum: ['full', 'dayMonth', 'week'], default: 'full' })
  dateInputMode!: 'full' | 'dayMonth' | 'week';

  @Prop({
    type: [
      {
        nr: Number,
        value: Number,
        gramm: Number,
        days: Number,
        dateRaw: String,
      },
    ],
    default: [],
  })
  bimiSeries!: MiteSample[];

  @Prop({
    type: [
      {
        nr: Number,
        value: Number,
        gramm: Number,
        days: Number,
        dateRaw: String,
      },
    ],
    default: [],
  })
  bomiSeries!: MiteSample[];

  @Prop({ type: Object, default: {} })
  importFields!: Record<string, unknown>;

  @Prop()
  queenNameSnapshot?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BreedingBookEntrySchema = SchemaFactory.createForClass(BreedingBookEntry);

BreedingBookEntrySchema.index({ userId: 1, code1a: 1, nst: 1, entryDate: 1 });
