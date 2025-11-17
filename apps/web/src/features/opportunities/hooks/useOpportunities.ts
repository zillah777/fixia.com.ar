import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  opportunitiesService,
  Opportunity,
  OpportunityFilters,
  ApplicationData,
} from '@/lib/services/opportunities.service';
import { PaginatedResponse } from '@/lib/api';
import { toast } from 'sonner';

// Query Keys - Centralized for cache management
export const opportunityKeys = {
  all: ['opportunities'] as const,
  lists: () => [...opportunityKeys.all, 'list'] as const,
  list: (filters: OpportunityFilters) => [...opportunityKeys.lists(), filters] as const,
  details: () => [...opportunityKeys.all, 'detail'] as const,
  detail: (id: string) => [...opportunityKeys.details(), id] as const,
  matching: () => [...opportunityKeys.all, 'matching'] as const,
  saved: () => [...opportunityKeys.all, 'saved'] as const,
  myApplications: () => [...opportunityKeys.all, 'my-applications'] as const,
  myProjects: () => [...opportunityKeys.all, 'my-projects'] as const,
};

/**
 * Hook para obtener oportunidades con filtros
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useOpportunities({
 *   category: 'Desarrollo Web',
 *   budgetMin: 1000,
 *   page: 1,
 * });
 * ```
 */
export function useOpportunities(filters?: OpportunityFilters) {
  return useQuery<PaginatedResponse<Opportunity>, Error>({
    queryKey: opportunityKeys.list(filters || {}),
    queryFn: () => opportunitiesService.getOpportunities(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener una oportunidad específica por ID
 *
 * @example
 * ```tsx
 * const { data: opportunity, isLoading } = useOpportunity('opp_123');
 * ```
 */
export function useOpportunity(id: string) {
  return useQuery<Opportunity, Error>({
    queryKey: opportunityKeys.detail(id),
    queryFn: () => opportunitiesService.getOpportunityById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook para aplicar a una oportunidad
 *
 * @example
 * ```tsx
 * const applyMutation = useApplyToOpportunity();
 *
 * applyMutation.mutate({
 *   opportunityId: 'opp_123',
 *   applicationData: { message: 'Me interesa', proposedBudget: 1500, ... }
 * });
 * ```
 */
export function useApplyToOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      opportunityId,
      applicationData,
    }: {
      opportunityId: string;
      applicationData: ApplicationData;
    }) => opportunitiesService.applyToOpportunity(opportunityId, applicationData),
    onSuccess: (_, variables) => {
      toast.success('¡Propuesta enviada exitosamente!');

      // Invalidar queries relacionadas para refrescar data
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(variables.opportunityId) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.myApplications() });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Error al enviar la propuesta';
      toast.error(errorMessage);

      if (process.env.NODE_ENV === 'development') {
        console.error('[useApplyToOpportunity] Error:', error);
      }
    },
  });
}

/**
 * Hook para retirar una aplicación
 */
export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opportunityId: string) => opportunitiesService.withdrawApplication(opportunityId),
    onSuccess: (_, opportunityId) => {
      toast.success('Aplicación retirada');
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(opportunityId) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.myApplications() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al retirar la aplicación');
    },
  });
}

/**
 * Hook para guardar/favoritar oportunidad
 */
export function useSaveOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opportunityId: string) => opportunitiesService.saveOpportunity(opportunityId),
    onSuccess: (_, opportunityId) => {
      toast.success('Oportunidad guardada en favoritos');
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(opportunityId) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.saved() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al guardar la oportunidad');
    },
  });
}

/**
 * Hook para quitar oportunidad de favoritos
 */
export function useUnsaveOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opportunityId: string) => opportunitiesService.unsaveOpportunity(opportunityId),
    onSuccess: (_, opportunityId) => {
      toast.success('Oportunidad eliminada de favoritos');
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(opportunityId) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.saved() });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al eliminar de favoritos');
    },
  });
}

/**
 * Hook para obtener oportunidades matching (algoritmo de IA)
 */
export function useMatchingOpportunities() {
  return useQuery<Opportunity[], Error>({
    queryKey: opportunityKeys.matching(),
    queryFn: () => opportunitiesService.getMatchingOpportunities(),
    staleTime: 1000 * 60 * 10, // 10 minutos (menos frecuente porque es costoso)
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook para obtener oportunidades guardadas
 */
export function useSavedOpportunities() {
  return useQuery<Opportunity[], Error>({
    queryKey: opportunityKeys.saved(),
    queryFn: () => opportunitiesService.getSavedOpportunities(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook para obtener mis aplicaciones
 */
export function useMyApplications() {
  return useQuery<Opportunity[], Error>({
    queryKey: opportunityKeys.myApplications(),
    queryFn: () => opportunitiesService.getMyApplications(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
