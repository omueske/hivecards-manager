import { IsString, IsOptional, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateHiveDto {
  @IsString()
  @IsNotEmpty()
  apiaryId!: string;

  @IsString()
  hiveNumber!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  frameCount?: number;

  @IsOptional()
  @IsString()
  installationDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  hiveBoxType?: string;

  @IsOptional()
  @IsString()
  hiveType?: string;

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
}
