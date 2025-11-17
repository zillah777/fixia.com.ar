import { useQuery } from '@tanstack/react-query';

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
      // Mock implementation - in real app this would call an API
      const { mockServices } = await import('../pages/ServicesPage');

      let filtered = mockServices;

      // Apply filters
      if (params.searchQuery) {
        filtered = filtered.filter(service =>
          service.title.toLowerCase().includes(params.searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(params.searchQuery.toLowerCase()) ||
          service.tags.some(tag => tag.toLowerCase().includes(params.searchQuery.toLowerCase()))
        );
      }

      if (params.selectedCategory !== 'Todos') {
        filtered = filtered.filter(service => service.category === params.selectedCategory);
      }

      filtered = filtered.filter(service =>
        service.price >= params.priceRange[0] && service.price <= params.priceRange[1]
      );

      // Apply sorting
      switch (params.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
          filtered.sort((a, b) => b.reviews - a.reviews);
          break;
        case 'newest':
          // Mock sorting by id
          filtered.sort((a, b) => b.id.localeCompare(a.id));
          break;
        default: // relevance
          filtered.sort((a, b) => b.rating - a.rating);
      }

      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}