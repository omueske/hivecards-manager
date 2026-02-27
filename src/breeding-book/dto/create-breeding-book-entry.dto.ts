import {
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MiteSampleDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  nr?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200)
  value?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  gramm?: number;

  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(28)
  days?: number;

  @IsOptional()
  @IsString()
  dateRaw?: string;
}

export class CreateBreedingBookEntryDto {
  @IsOptional()
  @IsString()
  queenId?: string;

  @IsOptional()
  @IsString()
  hiveId?: string;

  @IsOptional()
  @IsString()
  code1a?: string;

  @IsOptional()
  @IsString()
  l1a?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  lv1a?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  z1a?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99999)
  nr1a?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2050)
  j1a?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  nst?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  anpaarTyp?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  paarTyp?: number;

  @IsOptional()
  @IsString()
  line?: string;

  @IsOptional()
  @IsString()
  entryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['full', 'dayMonth', 'week'])
  dateInputMode?: 'full' | 'dayMonth' | 'week';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MiteSampleDto)
  bimiSeries?: MiteSampleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MiteSampleDto)
  bomiSeries?: MiteSampleDto[];

  @IsOptional()
  @IsObject()
  importFields?: Record<string, unknown>;
}
