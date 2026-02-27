import { IsString } from 'class-validator';

export class ImportBreedingBookCsvDto {
  @IsString()
  csvContent!: string;
}
