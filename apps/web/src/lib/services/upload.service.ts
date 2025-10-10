import { api } from '../api';

export interface UploadResponse {
  url: string;
  public_id?: string;
  format?: string;
  size?: number;
}

class UploadService {
  /**
   * Upload an image file
   * In production, this should upload to Cloudinary/S3
   * For now, it optimizes and converts to base64
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no debe superar 5MB');
      }

      // Resize and optimize image before upload
      const optimizedImage = await this.optimizeImage(file);

      // Convert to base64
      const base64 = await this.fileToBase64(optimizedImage);

      // In production, you would upload to a service:
      // const formData = new FormData();
      // formData.append('file', optimizedImage);
      // const response = await api.post('/upload/image', formData);
      // return response.data;

      // For now, return the optimized base64
      return {
        url: base64,
        format: file.type.split('/')[1],
        size: optimizedImage.size,
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(error.message || 'Error al subir la imagen');
    }
  }

  /**
   * Optimize image by resizing and compressing
   */
  private async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Error al procesar la imagen'));
            return;
          }

          // Calculate new dimensions (max 800x800)
          let width = img.width;
          let height = img.height;
          const maxSize = 800;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          // Set canvas size
          canvas.width = width;
          canvas.height = height;

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Error al comprimir la imagen'));
                return;
              }

              // Create new file from blob
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              resolve(optimizedFile);
            },
            'image/jpeg',
            0.85 // 85% quality
          );
        };

        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert file to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error('Error al convertir la imagen'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Delete an uploaded image
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await api.delete(`/upload/image/${publicId}`);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;
