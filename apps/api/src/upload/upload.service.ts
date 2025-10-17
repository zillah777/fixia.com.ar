import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

export interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private cloudinaryProvider: CloudinaryProvider) {}

  /**
   * Upload image to Cloudinary
   * @param file - Express.Multer.File object
   * @param folder - Cloudinary folder to upload to (e.g., 'avatars', 'services', 'portfolios')
   * @returns Upload result with URLs and metadata
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'fixia'
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const cloudinary = this.cloudinaryProvider.getCloudinary();

      // Create upload stream with options
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `fixia/${folder}`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good' }, // Automatic quality optimization
            { fetch_format: 'auto' }, // Automatic format selection (WebP, etc.)
          ],
          // Limit image size to 2000x2000 max
          eager: [
            { width: 800, height: 800, crop: 'limit' }, // Thumbnail
            { width: 1200, height: 1200, crop: 'limit' }, // Medium size
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${error.message}`, error);
            reject(new BadRequestException(`Error al subir imagen: ${error.message}`));
            return;
          }

          if (!result) {
            reject(new BadRequestException('No se recibió respuesta de Cloudinary'));
            return;
          }

          this.logger.log(`Image uploaded successfully: ${result.public_id}`);

          resolve({
            url: result.url,
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload avatar specifically (applies avatar transformations)
   */
  async uploadAvatar(file: Express.Multer.File): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const cloudinary = this.cloudinaryProvider.getCloudinary();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'fixia/avatars',
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop focused on face
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Avatar upload error: ${error.message}`, error);
            reject(new BadRequestException(`Error al subir avatar: ${error.message}`));
            return;
          }

          if (!result) {
            reject(new BadRequestException('No se recibió respuesta de Cloudinary'));
            return;
          }

          this.logger.log(`Avatar uploaded successfully: ${result.public_id}`);

          resolve({
            url: result.url,
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      const cloudinary = this.cloudinaryProvider.getCloudinary();
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok') {
        this.logger.warn(`Failed to delete image: ${publicId}, result: ${result.result}`);
        throw new BadRequestException('No se pudo eliminar la imagen');
      }

      this.logger.log(`Image deleted successfully: ${publicId}`);
    } catch (error: any) {
      this.logger.error(`Error deleting image: ${error.message}`, error);
      throw new BadRequestException(`Error al eliminar imagen: ${error.message}`);
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file: Express.Multer.File): void {
    // Check if file exists
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de archivo no válido. Solo se permiten: JPG, PNG, WebP, GIF'
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `El archivo es demasiado grande. Tamaño máximo: 5MB`
      );
    }
  }
}
