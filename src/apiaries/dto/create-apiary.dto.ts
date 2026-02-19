import { IsString, IsOptional } from 'class-validator';

export class CreateApiaryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
