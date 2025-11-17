import { useQuery } from '@tanstack/react-query';

interface UseOpportunitiesParams {
  searchQuery: string;
  selectedCategory: string;
  budgetRange: number[];
  sortBy: string;
  urgencyFilter: string[];
  locationFilter: string;
}

export function useOpportunities(params: UseOpportunitiesParams) {
  return useQuery({
    queryKey: ['opportunities', params],
    queryFn: async () => {
      // Mock implementation - in real app this would call an API
      // For now, return the mock data filtered by params
      const { mockOpportunities } = await import('../pages/OpportunitiesPage');

      let filtered = mockOpportunities;

      // Apply filters
      if (params.searchQuery) {
        filtered = filtered.filter(opp =>
          opp.title.toLowerCase().includes(params.searchQuery.toLowerCase()) ||
          opp.description.toLowerCase().includes(params.searchQuery.toLowerCase()) ||
          opp.skills.some(skill => skill.toLowerCase().includes(params.searchQuery.toLowerCase()))
        );
      }

      if (params.selectedCategory !== 'Todos') {
        filtered = filtered.filter(opp => opp.category === params.selectedCategory);
      }

      filtered = filtered.filter(opp =>
        opp.budget.min >= params.budgetRange[0] && opp.budget.max <= params.budgetRange[1]
      );

      if (!params.urgencyFilter.includes('all')) {
        filtered = filtered.filter(opp => params.urgencyFilter.includes(opp.urgency));
      }

      if (params.locationFilter !== 'all') {
        if (params.locationFilter === 'remote') {
          filtered = filtered.filter(opp => opp.location === 'Remoto');
        } else if (params.locationFilter === 'local') {
          filtered = filtered.filter(opp => opp.location !== 'Remoto');
        }
      }

      // Apply sorting
      switch (params.sortBy) {
        case 'budget_desc':
          filtered.sort((a, b) => b.budget.max - a.budget.max);
          break;
        case 'proposals_asc':
          filtered.sort((a, b) => a.proposals - b.proposals);
          break;
        case 'deadline':
          // Mock sorting by deadline
          filtered.sort((a, b) => a.id.localeCompare(b.id));
          break;
        case 'client_rating':
          filtered.sort((a, b) => b.client.rating - a.client.rating);
          break;
        default: // newest
          filtered.sort((a, b) => b.id.localeCompare(a.id));
      }

      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}