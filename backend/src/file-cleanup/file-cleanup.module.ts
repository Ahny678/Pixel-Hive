import { Module } from '@nestjs/common';
import { FileCleanupService } from './file-cleanup.service';

@Module({
  providers: [FileCleanupService],
  exports: [FileCleanupService],
})
export class FileCleanupModule {}
