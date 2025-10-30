import { Injectable } from '@nestjs/common';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class QrService {
  constructor(private readonly queueService: QueueService) {}

  async generateQr(data: string, userEmail?: string) {
    await this.queueService.addJob('qr-jobs', {
      type: 'generate',
      data,
      userEmail,
    });
    return { message: 'QR generation started' };
  }
  async decodeQr(filePath: string, userEmail?: string) {
    await this.queueService.addJob('qr-jobs', {
      type: 'decode',
      filePath, // ✅ matches DecodeQrJob
      userEmail,
    });
    return { message: 'QR decoding started' };
  }
}
