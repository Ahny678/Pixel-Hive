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

@Controller('qr')
@UseGuards(JwtAuthGuard)
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('generate')
  async generate(
    @Body('data') data: string,
    @Req() req: Request & { user: { userId: number; email: string } },
  ) {
    const userEmail = req.user.email;
    return this.qrService.generateQr(data, userEmail);
  }

  @Post('decode')
  @UseInterceptors(FileInterceptor('file', { dest: './uploads' }))
  async decode(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { userId: number; email: string } },
  ) {
    const userEmail = req.user.email;
    return this.qrService.decodeQr(file.path, userEmail);
  }
}
