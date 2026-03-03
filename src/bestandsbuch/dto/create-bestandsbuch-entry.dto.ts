import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateBestandsbuchEntryDto {
  @IsOptional()
  @IsIn(['manual', 'inspection-sync'])
  source?: 'manual' | 'inspection-sync';

  @IsOptional()
  @IsString()
  inspectionId?: string;

  @IsOptional()
  @IsString()
  hiveId?: string;

  @IsOptional()
  @IsString()
  beekeeperName?: string;

  @IsOptional()
  @IsString()
  streetHouseNumber?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  apiaryName?: string;

  @IsOptional()
  @IsString()
  operationNumber?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  sheetNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9999)
  sequenceNo?: number;

  @IsOptional()
  @IsString()
  applicationDate?: string;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  hiveLabel?: string;

  @IsOptional()
  @IsString()
  medicineName?: string;

  @IsOptional()
  @IsString()
  supplierNameAddress?: string;

  @IsOptional()
  @IsString()
  administrationType?: string;

  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsString()
  withdrawalPeriod?: string;

  @IsOptional()
  @IsString()
  treatedBy?: string;

  @IsOptional()
  @IsString()
  prescribingVet?: string;

  @IsOptional()
  @IsString()
  purchaseReceipt?: string;

  @IsOptional()
  @IsString()
  treatmentDuration?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
