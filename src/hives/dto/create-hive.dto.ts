import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateHiveDto {
  @IsOptional()
  @IsString()
  apiaryId?: string;

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
}
