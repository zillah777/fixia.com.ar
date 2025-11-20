import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { servicesService, type Service, type ServiceFilters } from '@/lib/services/services.service';
import { useSubscriptionStatus } from './useSubscriptionStatus';
import { toast } from 'sonner';

/**
 * useServiceManagement Hook
 * 
 * Manages professional's services with subscription checks and CRUD operations.
 * Wraps existing services.service.ts with React Query and subscription logic.
 * 
 * @param professionalId - Optional professional ID (defaults to current user)
 * @returns Service management functions and state
 * 
 * @example
 * ```typescript
 * const { services, createService, updateService, deleteService, toggleActive } = useServiceManagement();
 * 
 * // Create new service
 * await createService({
 *   title: 'Web Development',
 *   description: 'Professional web development services',
 *   category_id: 'cat-123',
 *   price: 5000,
 * });
 * ```
 */
export function useServiceManagement(professionalId?: string) {
    const queryClient = useQueryClient();

    // Get services count for subscription check
    const { data: servicesResponse } = useQuery({
        queryKey: ['myServices'],
        queryFn: () => servicesService.getMyServices(),
        enabled: !professionalId, // Only fetch if checking own services
    });

    const activeServicesCount = servicesResponse?.data?.filter(s => s.active).length || 0;

    // Subscription status with current service count
    const subscriptionStatus = useSubscriptionStatus(activeServicesCount);

    // Fetch professional's services
    const {
        data: services = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['professionalServices', professionalId],
        queryFn: async () => {
            if (professionalId) {
                return servicesService.getServicesByProfessional(professionalId);
            } else {
                const response = await servicesService.getMyServices();
                return response.data;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Create service mutation
    const createMutation = useMutation({
        mutationFn: (data: Partial<Service>) => {
            // Check subscription before creating
            if (!subscriptionStatus.canPublishServices) {
                throw new Error('No puedes publicar más servicios. Verifica tu suscripción o límite de servicios.');
            }
            return servicesService.createService(data);
        },
        onSuccess: () => {
            toast.success('Servicio publicado exitosamente');
            queryClient.invalidateQueries({ queryKey: ['professionalServices'] });
            queryClient.invalidateQueries({ queryKey: ['myServices'] });
        },
        onError: (error: any) => {
            const message = error?.message || error?.response?.data?.message || 'Error al publicar servicio';
            toast.error(message);
        },
    });

    // Update service mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) =>
            servicesService.updateService(id, data),
        onSuccess: () => {
            toast.success('Servicio actualizado');
            queryClient.invalidateQueries({ queryKey: ['professionalServices'] });
            queryClient.invalidateQueries({ queryKey: ['myServices'] });
        },
        onError: (error: any) => {
            const message = error?.message || error?.response?.data?.message || 'Error al actualizar servicio';
            toast.error(message);
        },
    });

    // Delete service mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => servicesService.deleteService(id),
        onSuccess: () => {
            toast.success('Servicio eliminado');
            queryClient.invalidateQueries({ queryKey: ['professionalServices'] });
            queryClient.invalidateQueries({ queryKey: ['myServices'] });
        },
        onError: (error: any) => {
            const message = error?.message || error?.response?.data?.message || 'Error al eliminar servicio';
            toast.error(message);
        },
    });

    // Toggle active status mutation
    const toggleActiveMutation = useMutation({
        mutationFn: (id: string) => servicesService.toggleServiceActive(id),
        onSuccess: (response) => {
            const status = response.service.active ? 'activado' : 'pausado';
            toast.success(`Servicio ${status}`);
            queryClient.invalidateQueries({ queryKey: ['professionalServices'] });
            queryClient.invalidateQueries({ queryKey: ['myServices'] });
        },
        onError: (error: any) => {
            const message = error?.message || error?.response?.data?.message || 'Error al cambiar estado';
            toast.error(message);
        },
    });

    return {
        // Data
        services,
        isLoading,
        error,

        // Subscription status
        subscriptionStatus,

        // Stats
        totalServices: services.length,
        activeServices: services.filter(s => s.active).length,
        inactiveServices: services.filter(s => !s.active).length,

        // Mutations
        createService: createMutation.mutate,
        updateService: updateMutation.mutate,
        deleteService: deleteMutation.mutate,
        toggleActive: toggleActiveMutation.mutate,

        // Mutation states
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isToggling: toggleActiveMutation.isPending,

        // Refetch
        refetch,
    };
}

/**
 * useServiceAnalytics Hook
 * 
 * Fetch analytics for professional's services
 */
export function useServiceAnalytics() {
    return useQuery({
        queryKey: ['serviceAnalytics'],
        queryFn: () => servicesService.getMyServicesAnalytics(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * useServiceDetail Hook
 * 
 * Fetch single service details
 */
export function useServiceDetail(serviceId: string) {
    return useQuery({
        queryKey: ['service', serviceId],
        queryFn: () => servicesService.getServiceById(serviceId),
        enabled: !!serviceId,
        staleTime: 5 * 60 * 1000,
    });
}
