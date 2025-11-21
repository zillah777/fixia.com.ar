import { useQuery } from '@tanstack/react-query';
import { servicesService } from '../lib/services';

interface UseServicesParams {
  searchQuery: string;
  selectedCategory: string;
  priceRange: number[];
  sortBy: string;
}

export function useServices(params: UseServicesParams) {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      // Build API filters
      const apiFilters: any = {
        page: 1,
        limit: 50,
        sortBy: params.sortBy === 'relevance' ? 'popular' : params.sortBy,
        sortOrder: params.sortBy.includes('_desc') ? 'desc' : 'asc'
      };

      // Category filter
      if (params.selectedCategory !== "Todos") {
        apiFilters.category = params.selectedCategory;
      }

      // Search query
      if (params.searchQuery) {
        apiFilters.search = params.searchQuery;
      }

      // Price range
      if (params.priceRange[0] > 0 || params.priceRange[1] < 3000) {
        apiFilters.minPrice = params.priceRange[0];
        apiFilters.maxPrice = params.priceRange[1];
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
}