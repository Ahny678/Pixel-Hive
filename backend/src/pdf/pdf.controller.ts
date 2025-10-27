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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PdfService } from './pdf.service';
import { CreatePdfDto } from './dtos/create-pdf.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('PDF')
@ApiBearerAuth() // Adds the JWT bearer token auth section in Swagger
@Controller('pdf')
export class PdfController {
  constructor(private pdfService: PdfService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @ApiOperation({ summary: 'Generate a PDF from text or HTML' })
  @ApiResponse({ status: 201, description: 'PDF successfully generated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  generate(
    @Req() req: Request & { user: { userId: number; email: string } },
    @Body() dto: CreatePdfDto,
  ) {
    return this.pdfService.generatePdf(req.user.userId, { ...dto });
  }

  @UseGuards(JwtAuthGuard)
  @Post('merge')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Merge multiple uploaded images into a single PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload up to 10 images to merge into one PDF',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images merged into PDF successfully',
  })
  @ApiResponse({ status: 400, description: 'No images uploaded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get the status of a PDF generation job by ID' })
  @ApiParam({ name: 'id', description: 'Job ID', example: 123 })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStatus(@Param('id') id: string) {
    return this.pdfService.getJobStatus(Number(id));
  }
}
