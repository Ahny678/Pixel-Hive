import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name);

  async deleteFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
          this.logger.log(`Deleted file: ${filePath}`);
        } else {
          this.logger.warn(`File not found (skipped): ${filePath}`);
        }
      } catch (err) {
        this.logger.error(`Failed to delete file ${filePath}`, err);
      }
    }
  }

  async deleteFolder(folderPath: string): Promise<void> {
    try {
      if (fs.existsSync(folderPath)) {
        await fs.promises.rm(folderPath, { recursive: true, force: true });
        this.logger.log(`Deleted folder: ${folderPath}`);
      } else {
        this.logger.warn(`Folder not found (skipped): ${folderPath}`);
      }
    } catch (err) {
      this.logger.error(`Failed to delete folder ${folderPath}`, err);
    }
  }
}
