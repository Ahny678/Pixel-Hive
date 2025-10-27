import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { pdfHtmlExample, pdfTextExample } from 'src/examples/pdf.example';

export class CreatePdfDto {
  @ApiPropertyOptional({
    description: 'Verbose plain text content to include in the PDF document.',
    example: pdfTextExample,
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'Detailed HTML content to render as a styled PDF.',
    example: pdfHtmlExample,
  })
  @IsOptional()
  @IsString()
  html?: string;
}
