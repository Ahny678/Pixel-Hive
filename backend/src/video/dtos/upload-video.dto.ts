import { IsOptional, IsArray, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UploadVideoDto {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Handle "1,3,5,10" or "[1,3,5,10]" from Swagger
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map(Number);
      } catch {
        return value
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .map(Number);
      }
    }
    if (Array.isArray(value)) {
      return value.map((v) => Number(v));
    }
    return [];
  })
  @IsNumber({}, { each: true })
  timestamps?: number[];
}
