import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Body,
  Req,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { WatermarkService } from './watermark.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UploadWatermarkDto } from './dto/upload-watermark.dto';

@ApiTags('Watermark')
@Controller('watermark')
export class WatermarkController {
  constructor(private watermarkService: WatermarkService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainFile', maxCount: 1 },
        { name: 'watermarkFile', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/watermark',
          filename: (req, file, cb) => {
            const filename = `${Date.now()}-${file.originalname}`;
            cb(null, filename);
          },
        }),
      },
    ),
  )
  @ApiOperation({ summary: 'Upload files for watermarking' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Watermark upload payload',
    schema: {
      type: 'object',
      properties: {
        mainFile: {
          type: 'string',
          format: 'binary',
          description: 'Main file to watermark (image or PDF)', // Removed video
        },
        watermarkFile: {
          type: 'string',
          format: 'binary',
          description:
            'Watermark image file (required for IMAGE watermark type)',
        },
        watermarkType: {
          type: 'string',
          enum: ['TEXT', 'IMAGE'],
        },
        fileType: {
          type: 'string',
          enum: ['IMAGE', 'PDF'], // Removed VIDEO
        },
        textContent: {
          type: 'string',
          description: 'Text content for text watermark',
        },
        position: {
          type: 'string',
          enum: [
            'top-left',
            'top-right',
            'center',
            'bottom-left',
            'bottom-right',
          ],
        },
        opacity: {
          type: 'number',
          minimum: 0,
          maximum: 1,
        },
        fontSize: {
          type: 'number',
        },
      },
      required: ['mainFile', 'fileType', 'watermarkType'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully, watermarking queued',
    schema: {
      example: {
        message: 'Watermarking job queued successfully',
        jobId: 123,
      },
    },
  })
  async uploadWatermark(
    @Req() req: Request & { user: { userId: number; email: string } },
    @UploadedFiles()
    files: {
      mainFile?: Express.Multer.File[];
      watermarkFile?: Express.Multer.File[];
    },
    @Body() dto: UploadWatermarkDto,
  ) {
    const main = files.mainFile?.[0];
    const watermark = files.watermarkFile?.[0];
    const allFiles = [main, watermark].filter(Boolean) as Express.Multer.File[];
    return this.watermarkService.uploadWatermark(
      req.user.userId,
      allFiles,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/status')
  @ApiOperation({ summary: 'Get the processing status of a watermark job' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Watermark job ID',
    example: 42,
  })
  @ApiResponse({
    status: 200,
    description: 'Current status of the watermark job',
    schema: {
      example: {
        id: 42,
        status: 'completed',
        inputFileUrl: 'https://res.cloudinary.com/.../input.jpg',
        outputFileUrl: 'https://res.cloudinary.com/.../watermarked.jpg',
      },
    },
  })
  getStatus(@Param('id') id: number) {
    return this.watermarkService.getJobStatus(+id);
  }
}
