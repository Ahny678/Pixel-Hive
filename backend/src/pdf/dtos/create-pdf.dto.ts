// import { IsString, IsOptional } from 'class-validator';

import { IsOptional, IsString } from 'class-validator';

export class CreatePdfDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  formData?: string; // Optional JSON as string
}
