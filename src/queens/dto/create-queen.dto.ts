import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsIn,
  IsDateString,
} from 'class-validator';

export class CreateQueenDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  queenYear?: number;

  @IsOptional()
  @IsString()
  queenColor?: string;

  @IsOptional()
  @IsString()
  queenOrigin?: string;

  @IsOptional()
  @IsString()
  matingType?: string;

  @IsOptional()
  @IsBoolean()
  queenMarked?: boolean;

  @IsOptional()
  @IsIn(['active', 'spare', 'dead', 'sold'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignQueenDto {
  @IsString()
  hiveId!: string;

  @IsOptional()
  @IsDateString()
  from?: string; // defaults to now
}

export class RemoveQueenFromHiveDto {
  @IsOptional()
  @IsDateString()
  to?: string; // defaults to now
}
