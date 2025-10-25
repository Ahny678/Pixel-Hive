import { IsOptional, IsArray, IsNumber } from 'class-validator';

export class UploadVideoDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  timestamps?: number[];
}
