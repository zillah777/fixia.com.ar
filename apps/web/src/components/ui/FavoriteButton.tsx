import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from './button';
import { favoritesService } from '../../lib/services/favorites.service';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  userId: string;
  userName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'default' | 'outline';
  showLabel?: boolean;
  className?: string;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

export function FavoriteButton({
  userId,
  userName = 'usuario',
  size = 'md',
  variant = 'ghost',
  showLabel = false,
  className = '',
  onFavoriteChange,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check favorite status on mount
  useEffect(() => {
    checkFavoriteStatus();
  }, [userId]);

  const checkFavoriteStatus = async () => {
    try {
      setCheckingStatus(true);
      // Get all favorites and check if this professional is in there
      const favorites = await favoritesService.getFavoriteProfessionals();
      const isFav = favorites.some(f => f.professional.id === userId);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);

      if (isFavorite) {
        await favoritesService.removeProfessionalFromFavorites(userId);
        setIsFavorite(false);
        toast.success(`${userName} removido de favoritos`);
      } else {
        await favoritesService.addProfessionalToFavorites(userId);
        setIsFavorite(true);
        toast.success(`${userName} agregado a favoritos`);
      }

      onFavoriteChange?.(isFavorite);
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error(
        error.response?.data?.message ||
          'Error al actualizar favoritos'
      );
    } finally {
      setLoading(false);
    }
  };

  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeMap = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-10 w-10',
  };

  if (checkingStatus) {
    return (
      <Button
        variant={variant}
        size="sm"
        disabled
        className={className}
      >
        <Loader2 className={`${sizeMap[size]} animate-spin`} />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={toggleFavorite}
      disabled={loading}
      className={`${buttonSizeMap[size]} p-0 ${className}`}
      title={isFavorite ? `Remover de favoritos` : `Agregar a favoritos`}
    >
      {loading ? (
        <Loader2 className={`${sizeMap[size]} animate-spin`} />
      ) : (
        <>
          <Heart
            className={`${sizeMap[size]} transition-colors ${
              isFavorite
                ? 'fill-destructive text-destructive'
                : 'text-muted-foreground hover:text-destructive'
            }`}
          />
          {showLabel && (
            <span className="ml-1 text-sm">
              {isFavorite ? 'Favorito' : 'Agregar'}
            </span>
          )}
        </>
      )}
    </Button>
  );
}
