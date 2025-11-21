import { useQuery } from "@tanstack/react-query";
import { servicesService } from "../lib/services";
import { logger } from "../utils/logger";

interface Filters {
  searchQuery: string;
  selectedCategory: string;
  priceRange: number[];
  sortBy: string;
}

/**
 * Hook to fetch and filter services from the real API
 */
export const useServices = (filters: Filters) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: async () => {
      logger.debug("Fetching services with filters:", filters);

      // Build API filters
      const apiFilters: any = {
        page: 1,
        limit: 50,
        sortBy: filters.sortBy === 'relevance' ? 'popular' : filters.sortBy,
        sortOrder: filters.sortBy.includes('_desc') ? 'desc' : 'asc'
      };

      // Category filter
      if (filters.selectedCategory !== "Todos") {
        apiFilters.category = filters.selectedCategory;
      }

      // Search query
      if (filters.searchQuery) {
        apiFilters.search = filters.searchQuery;
      }

      // Price range
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 3000) {
        apiFilters.minPrice = filters.priceRange[0];
        apiFilters.maxPrice = filters.priceRange[1];
      }

      // Fetch from API
      const response = await servicesService.getServices(apiFilters);

      // Return the data array from paginated response
      return response.data || [];
    },
    // Keep previous data while fetching next set
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};