import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PdfService } from './pdf.service';
import { CreatePdfDto } from './dtos/create-pdf.dto';
import { MergeImagesDto } from './dtos/merge-images.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('pdf')
export class PdfController {
  constructor(private pdfService: PdfService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  generate(
    @Req() req: Request & { user: { userId: number; email: string } },
    @Body() dto: CreatePdfDto,
  ) {
    return this.pdfService.generatePdf(req.user.userId, { ...dto });
  }

  @UseGuards(JwtAuthGuard)
  @Post('merge')
  merge(
    @Req() req: Request & { user: { userId: number; email: string } },
    @Body() dto: MergeImagesDto,
  ) {
    return this.pdfService.mergeImages(req.user.userId, { ...dto });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.pdfService.getJobStatus(Number(id));
  }
}
