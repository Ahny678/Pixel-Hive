import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export enum WatermarkType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export enum FileType {
  IMAGE = 'IMAGE',
  PDF = 'PDF',
}

export enum Position {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  CENTER = 'center',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
}

export class UploadWatermarkDto {
  @ApiProperty({ enum: WatermarkType })
  @IsEnum(WatermarkType)
  watermarkType: WatermarkType;

  @ApiProperty({ enum: FileType })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({ required: false, enum: Position })
  @IsOptional()
  @IsString()
  position?: Position;

  @ApiProperty({ required: false, minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  opacity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fontSize?: number;

  // Optional field to tolerate empty uploads in Swagger
  @IsOptional()
  watermarkFile?: any;
}
