import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTreatmentAgentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;
}
