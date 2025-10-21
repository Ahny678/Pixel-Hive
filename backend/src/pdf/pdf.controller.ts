import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PdfService } from './pdf.service';
import { CreatePdfDto } from './dtos/create-pdf.dto';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(FilesInterceptor('images', 10)) // up to 10 images
  async merge(
    @Req() req: Request & { user: { userId: number; email: string } },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new Error('No images uploaded');
    }

    return this.pdfService.mergeImages(req.user.userId, req.user.email, files);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.pdfService.getJobStatus(Number(id));
  }
}
