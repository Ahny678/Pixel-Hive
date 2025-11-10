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
        folder: folder ?? 'pdfs',
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        type: 'upload',
        access_mode: 'public',
      };

      const result = await cloudinary.uploader.upload(filePath, options);
      fs.unlinkSync(filePath); // remove local file
      return result;
    } catch (error) {
      console.error('[CloudinaryService] Upload failed:', error);
      throw new InternalServerErrorException('Cloudinary upload failed');
    }
  }

  /**
   * Upload a buffer (e.g., generated image or video) directly to Cloudinary.
   * @param buffer The file data as a Buffer
   * @param folder Cloudinary folder name
   * @param resourceType 'image' | 'video' | 'raw'
   * @param publicId Optional custom Cloudinary public ID
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
    publicId?: string,
  ): Promise<UploadApiResponse> {
    try {
      return await new Promise((resolve, reject) => {
        const options: UploadApiOptions = {
          folder,
          resource_type: resourceType,
          public_id: publicId,
          use_filename: true,
          unique_filename: !publicId,
          type: 'upload',
          access_mode: 'public',
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) {
              console.error('[CloudinaryService] Buffer upload failed:', error);
              return reject(
                new InternalServerErrorException(
                  'Cloudinary buffer upload failed',
                ),
              );
            }
            resolve(result as UploadApiResponse);
          },
        );

        uploadStream.end(buffer);
      });
    } catch (error) {
      console.error('[CloudinaryService] Upload buffer error:', error);
      throw new InternalServerErrorException('Cloudinary buffer upload failed');
    }
  }

  /**
   * Delete a file from Cloudinary using its public_id.
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

  /**
   * Return a transformed Cloudinary URL.
   */
  buildThumbnailUrl(publicId: string, timestamp: number): string {
    return cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        {
          start_offset: timestamp.toString(),
          width: 320,
          height: 240,
          crop: 'fill',
        },
      ],
    });
  }
  buildUrl(
    publicId: string,
    options: {
      transformations?: string[];
      resourceType?: 'image' | 'video' | 'raw';
      format?: string;
    } = {},
  ): string {
    const { transformations = [], resourceType = 'image', format } = options;
    const transformationStr =
      transformations.length > 0 ? transformations.join('/') + '/' : '';
    const formatStr = format ? `.${format}` : '';
    const cloudName = cloudinary.config().cloud_name;
    if (!cloudName) throw new Error('Cloudinary not configured');
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformationStr}${publicId}${formatStr}`;
  }
}
