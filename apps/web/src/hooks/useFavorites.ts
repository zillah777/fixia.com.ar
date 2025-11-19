import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { Service } from '../types';

interface FavoriteService {
  id: string;
  title: string;
  professionalName: string;
  dateAdded: string;
}

interface FavoriteProfessional {
  id: string;
  name: string;
  businessName?: string;
  dateAdded: string;
}

// Temporary User type until backend types are aligned
type User = any;

function useFavorites() {
  const [favoriteServices, setFavoriteServices] = useLocalStorage<FavoriteService[]>('fixia_favorite_services', []);
  const [favoriteProfessionals, setFavoriteProfessionals] = useLocalStorage<FavoriteProfessional[]>('fixia_favorite_professionals', []);

  // Service favorites
  const addServiceToFavorites = useCallback((service: Service) => {
    const favorite: FavoriteService = {
      id: service.id,
      title: service.title,
      professionalName: service.professional.name,
      dateAdded: new Date().toISOString()
    };

    setFavoriteServices(prev => {
      if (prev.some(fav => fav.id === service.id)) {
        return prev; // Already in favorites
      }
      return [...prev, favorite];
    });
  }, [setFavoriteServices]);

  const removeServiceFromFavorites = useCallback((serviceId: string) => {
    setFavoriteServices(prev => prev.filter(fav => fav.id !== serviceId));
  }, [setFavoriteServices]);

  const isServiceFavorite = useCallback((serviceId: string) => {
    return favoriteServices.some(fav => fav.id === serviceId);
  }, [favoriteServices]);

  const toggleServiceFavorite = useCallback((service: Service) => {
    if (isServiceFavorite(service.id)) {
      removeServiceFromFavorites(service.id);
    } else {
      addServiceToFavorites(service);
    }
  }, [isServiceFavorite, removeServiceFromFavorites, addServiceToFavorites]);

  // Professional favorites
  const addProfessionalToFavorites = useCallback((professional: User) => {
    const favorite: FavoriteProfessional = {
      id: professional.id,
      name: professional.name || professional.fullName || 'Professional',
      businessName: professional.businessName || professional.description?.substring(0, 50),
      dateAdded: new Date().toISOString()
    };

    setFavoriteProfessionals(prev => {
      if (prev.some(fav => fav.id === professional.id)) {
        return prev; // Already in favorites
      }
      return [...prev, favorite];
    });
  }, [setFavoriteProfessionals]);

  const removeProfessionalFromFavorites = useCallback((professionalId: string) => {
    setFavoriteProfessionals(prev => prev.filter(fav => fav.id !== professionalId));
  }, [setFavoriteProfessionals]);

  const isProfessionalFavorite = useCallback((professionalId: string) => {
    return favoriteProfessionals.some(fav => fav.id === professionalId);
  }, [favoriteProfessionals]);

  const toggleProfessionalFavorite = useCallback((professional: User) => {
    if (isProfessionalFavorite(professional.id)) {
      removeProfessionalFromFavorites(professional.id);
    } else {
      addProfessionalToFavorites(professional);
    }
  }, [isProfessionalFavorite, removeProfessionalFromFavorites, addProfessionalToFavorites]);

  // Clear all favorites
  const clearAllFavorites = useCallback(() => {
    setFavoriteServices([]);
    setFavoriteProfessionals([]);
  }, [setFavoriteServices, setFavoriteProfessionals]);

  return {
    // Services
    favoriteServices,
    addServiceToFavorites,
    removeServiceFromFavorites,
    isServiceFavorite,
    toggleServiceFavorite,

    // Professionals
    favoriteProfessionals,
    addProfessionalToFavorites,
    removeProfessionalFromFavorites,
    isProfessionalFavorite,
    toggleProfessionalFavorite,

    // Utilities
    clearAllFavorites,
    totalFavorites: favoriteServices.length + favoriteProfessionals.length
  };
}

export default useFavorites;