import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../lib/api';

interface FileUploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  maxFiles?: number;
}

interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface UseSecureFileUploadReturn {
  uploadFile: (file: File, endpoint: string) => Promise<FileUploadResult>;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

const DEFAULT_CONFIG: FileUploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxFiles: 1
};

export const useSecureFileUpload = (config: Partial<FileUploadConfig> = {}): UseSecureFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Validar tipo de archivo
    if (!finalConfig.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido. Solo se aceptan: ${finalConfig.allowedTypes.join(', ')}`
      };
    }

    // Validar tamaño
    if (file.size > finalConfig.maxSize) {
      const maxSizeMB = finalConfig.maxSize / (1024 * 1024);
      return {
        isValid: false,
        error: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`
      };
    }

    // Validar que el archivo tenga contenido
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'El archivo está vacío'
      };
    }

    // Validar nombre de archivo (prevenir path traversal)
    if (file.name.includes('../') || file.name.includes('..\\')) {
      return {
        isValid: false,
        error: 'Nombre de archivo no válido'
      };
    }

    return { isValid: true };
  };

  const sanitizeFilename = (filename: string): string => {
    // Remover caracteres peligrosos y mantener solo alfanuméricos, puntos y guiones
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  };

  const uploadFile = async (file: File, endpoint: string): Promise<FileUploadResult> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Validar archivo
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Sanitizar nombre de archivo
      const sanitizedFilename = sanitizeFilename(file.name);
      
      // Crear FormData
      const formData = new FormData();
      formData.append('file', file, sanitizedFilename);
      formData.append('originalName', file.name);
      formData.append('fileType', file.type);
      formData.append('fileSize', file.size.toString());

      // Agregar headers de seguridad
      const uploadResponse = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-File-Type': file.type,
          'X-File-Size': file.size.toString(),
          'X-Original-Name': encodeURIComponent(file.name),
        },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      const result: FileUploadResult = {
        url: uploadResponse.data.url,
        filename: uploadResponse.data.filename,
        size: file.size,
        type: file.type
      };

      toast.success('Archivo subido correctamente');
      return result;

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al subir el archivo';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
    error
  };
};

export default useSecureFileUpload;