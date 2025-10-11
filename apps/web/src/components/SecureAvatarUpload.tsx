import React, { useState, useRef, memo, useCallback } from 'react';
import { Camera, Upload, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import useSecureFileUpload from '../hooks/useSecureFileUpload';
import { useSecureAuth } from '../context/SecureAuthContext';

interface SecureAvatarUploadProps {
  currentAvatar?: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
  className?: string;
}

export const SecureAvatarUpload = memo<SecureAvatarUploadProps>(({ 
  currentAvatar, 
  onAvatarUpdate, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useSecureAuth();

  const { uploadFile, isUploading, progress, error } = useSecureFileUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validación adicional del lado cliente
    if (!file.type.startsWith('image/')) {
      return;
    }

    setSelectedFile(file);
    
    // Crear preview seguro
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadFile(selectedFile, '/user/avatar');
      onAvatarUpdate(result.url);
      setIsOpen(false);
      resetForm();
    } catch (error) {
      // Error ya manejado por el hook
    }
  }, [selectedFile, uploadFile, onAvatarUpdate, resetForm]);

  const handleCancel = useCallback(() => {
    resetForm();
    setIsOpen(false);
  }, [resetForm]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="icon" 
          className={`absolute -bottom-2 -right-2 h-10 w-10 rounded-full liquid-gradient shadow-lg hover:scale-105 transition-transform ${className}`}
        >
          <Camera className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="glass border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Cambiar Foto de Perfil</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Avatar Preview */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-muted">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : currentAvatar ? (
                <img 
                  src={currentAvatar} 
                  alt="Avatar actual" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                  <span className="text-2xl font-bold text-primary">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* File Input */}
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline" 
              className="w-full glass border-white/20 hover:glass-medium"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Seleccionar Nueva Imagen
            </Button>

            {/* File Info */}
            {selectedFile && (
              <div className="p-3 glass-medium rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm text-white">
                      {selectedFile.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Subiendo archivo...
                  </span>
                  <span className="text-sm text-primary">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert className="border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Guidelines */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Formatos aceptados: JPG, PNG, WebP</p>
              <p>• Tamaño máximo: 5MB</p>
              <p>• Recomendado: 400x400px o superior</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="flex-1 glass border-white/20"
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button 
              onClick={handleUpload}
              className="flex-1 liquid-gradient hover:opacity-90"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 mr-2" />
                  Subiendo...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Actualizar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default SecureAvatarUpload;