import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('qr')
@UseGuards(JwtAuthGuard)
@ApiTags('QR')
@ApiBearerAuth()
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a QR code from string data' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          example: 'https://portfolio-site-two-pink.vercel.app/',
        },
      },
      required: ['data'],
    },
  })
  @ApiResponse({ status: 201, description: 'QR generation started' })
  async generate(
    @Body('data') data: string,
    @Req() req: Request & { user: { userId: number; email: string } },
  ) {
    const userEmail = req.user.email;
    return this.qrService.generateQr(data, userEmail);
  }

  @Post('decode')
  @ApiOperation({ summary: 'Decode a QR code from an uploaded image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'QR decoding started' })
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async decode(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { userId: number; email: string } },
  ) {
    const userEmail = req.user.email;
    return this.qrService.decodeQr(file.path, userEmail);
  }
}
