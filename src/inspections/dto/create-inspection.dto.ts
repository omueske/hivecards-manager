import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
  IsNotEmpty,
} from 'class-validator';

const TYPES = ['inspection', 'treatment', 'feeding', 'harvest', 'note'] as const;

export class CreateInspectionDto {
  @IsString()
  @IsNotEmpty()
  hiveId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsOptional()
  @IsIn(TYPES)
  type?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  queenSeen?: boolean;

  @IsOptional()
  @IsString()
  broodStatus?: string;

  @IsOptional()
  @IsNumber()
  varroaCount?: number;

  @IsOptional()
  @IsString()
  actionsTaken?: string;

  @IsOptional()
  @IsNumber()
  frameCount?: number;

  @IsOptional()
  @IsString()
  weather?: string;
}
