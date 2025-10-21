import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import * as fs from 'fs';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload a file from local path to Cloudinary.
   * @param filePath Local path to the file.
   * @param folder Optional Cloudinary folder (e.g., 'pdfs', 'avatars').
   * @param resourceType Cloudinary resource type: 'image' | 'raw' | 'video'
   */

  async uploadFile(
    filePath: string,
    folder?: string,
    resourceType: 'auto' | 'raw' | 'image' | 'video' = 'auto',
  ): Promise<UploadApiResponse> {
    try {
      const options: UploadApiOptions = {
        folder: 'pdfs',
        resource_type: 'raw', // explicitly raw for PDFs
        use_filename: true,
        unique_filename: true,
        type: 'upload', // ✅ makes delivery public
        access_mode: 'public',
      };

      const result = await cloudinary.uploader.upload(filePath, options);
      fs.unlinkSync(filePath);
      return result;
    } catch (error) {
      console.error('[CloudinaryService] Upload failed:', error);
      throw new InternalServerErrorException('Cloudinary upload failed');
    }
  }

  /**
   * Delete a file from Cloudinary using its public_id
   */
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' = 'raw',
  ) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      console.error('[CloudinaryService] Delete failed:', error);
      throw new InternalServerErrorException('Cloudinary delete failed');
    }
  }
}
