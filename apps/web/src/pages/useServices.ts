import { useQuery } from "@tanstack/react-query";
import { mockServices } from "../pages/ServicesPage";
import { logger } from "../utils/logger";

interface Filters {
  searchQuery: string;
  selectedCategory: string;
  priceRange: number[];
  sortBy: string;
}

/**
 * Simula una llamada a la API para obtener y filtrar servicios.
 * En una aplicación real, esto haría una petición a un endpoint del backend
 * pasando los filtros como query params.
 */
const fetchServices = async (filters: Filters) => {
  logger.debug("Fetching services with filters:", filters);
  // Simula la latencia de la red
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = mockServices;

  // Lógica de filtrado (extraída de ServicesPage.tsx)
  if (filters.selectedCategory !== "Todos") {
    filtered = filtered.filter(service => service.category === filters.selectedCategory);
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(service =>
      service.title.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  filtered = filtered.filter(service =>
    service.price >= filters.priceRange[0] && service.price <= filters.priceRange[1]
  );

  // Lógica de ordenamiento (extraída de ServicesPage.tsx)
  switch (filters.sortBy) {
    case "price_asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case "popular":
      filtered.sort((a, b) => b.completedProjects - a.completedProjects);
      break;
    case "newest":
      // Para la demo, se baraja el array. En una app real, se ordenaría por fecha de creación.
      filtered.sort(() => Math.random() - 0.5);
      break;
    default: // "relevance"
      // No se aplica ordenamiento, se mantiene el original.
      break;
  }

  return filtered;
};

export const useServices = (filters: Filters) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: () => fetchServices(filters),
    placeholderData: (previousData) => previousData,
  });
};