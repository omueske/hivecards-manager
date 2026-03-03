import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BestandsbuchEntryDocument = BestandsbuchEntry & Document;

@Schema({ timestamps: true })
export class BestandsbuchEntry {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ index: true })
  inspectionId?: string;

  @Prop({ index: true })
  hiveId?: string;

  @Prop({ index: true })
  year?: number;

  @Prop()
  beekeeperName?: string;

  @Prop()
  streetHouseNumber?: string;

  @Prop()
  postalCode?: string;

  @Prop()
  city?: string;

  @Prop()
  phone?: string;

  @Prop()
  apiaryName?: string;

  @Prop()
  operationNumber?: string;

  @Prop({ default: 1 })
  sheetNumber?: number;

  @Prop({ index: true })
  sequenceNo?: number;

  @Prop({ index: true })
  applicationDate?: string;

  @Prop()
  hiveLabel?: string;

  @Prop()
  medicineName?: string;

  @Prop()
  supplierNameAddress?: string;

  @Prop()
  administrationType?: string;

  @Prop()
  amount?: string;

  @Prop()
  withdrawalPeriod?: string;

  @Prop()
  treatedBy?: string;

  @Prop()
  prescribingVet?: string;

  @Prop()
  purchaseReceipt?: string;

  @Prop()
  treatmentDuration?: string;

  @Prop()
  notes?: string;

  @Prop({ enum: ['manual', 'inspection-sync'], default: 'manual' })
  source!: 'manual' | 'inspection-sync';

  createdAt?: Date;
  updatedAt?: Date;
}

export const BestandsbuchEntrySchema = SchemaFactory.createForClass(BestandsbuchEntry);
BestandsbuchEntrySchema.index({ userId: 1, year: 1, sequenceNo: 1 }, { unique: false });
BestandsbuchEntrySchema.index({ userId: 1, inspectionId: 1 }, { unique: false, sparse: true });
