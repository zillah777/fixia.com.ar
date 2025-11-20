import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { ServiceRequest, ServiceRequestStatus } from '@/types/professional-circuit';

/**
 * Service Request Hook
 * 
 * Manages service requests between clients and professionals:
 * - Clients can request a service
 * - Professionals receive notifications
 * - Professionals can accept/reject requests
 * - On accept → Match is created
 * 
 * @example
 * ```typescript
 * // Client requesting a service
 * const { createRequest } = useServiceRequest();
 * await createRequest({ 
 *   service_id: 'svc-123', 
 *   message: 'Necesito ayuda con...' 
 * });
 * 
 * // Professional responding
 * const { respondToRequest } = useServiceRequest();
 * await respondToRequest({ id: 'req-123', action: 'accept' });
 * ```
 */

interface CreateRequestData {
    service_id: string;
    message?: string;
    budget?: number;
    deadline?: string;
}

interface RespondToRequestData {
    id: string;
    action: 'accept' | 'reject';
    message?: string;
}

export function useServiceRequest() {
    const queryClient = useQueryClient();

    // Fetch user's service requests (as client)
    const {
        data: myRequests = [],
        isLoading: isLoadingRequests,
        refetch: refetchRequests,
    } = useQuery({
        queryKey: ['serviceRequests', 'my'],
        queryFn: async () => {
            const response = await api.get<ServiceRequest[]>('/service-requests/my');
            return response;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch incoming requests (as professional)
    const {
        data: incomingRequests = [],
        isLoading: isLoadingIncoming,
        refetch: refetchIncoming,
    } = useQuery({
        queryKey: ['serviceRequests', 'incoming'],
        queryFn: async () => {
            const response = await api.get<ServiceRequest[]>('/service-requests/incoming');
            return response;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for incoming)
    });

    // Create service request (client)
    const createRequestMutation = useMutation({
        mutationFn: async (data: CreateRequestData) => {
            return api.post<ServiceRequest>('/service-requests', data);
        },
        onSuccess: (data) => {
            toast.success('Solicitud enviada al profesional', {
                description: 'Recibirás una notificación cuando responda',
            });
            queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Error al enviar solicitud';
            toast.error(message);
        },
    });

    // Respond to service request (professional)
    const respondToRequestMutation = useMutation({
        mutationFn: async ({ id, action, message }: RespondToRequestData) => {
            return api.post<{ request: ServiceRequest; match?: any }>(
                `/service-requests/${id}/${action}`,
                { message }
            );
        },
        onSuccess: (data, variables) => {
            if (variables.action === 'accept') {
                toast.success('¡Solicitud aceptada!', {
                    description: 'Match creado. Ahora puedes contactar al cliente.',
                });
                // Trigger match celebration if needed
                queryClient.invalidateQueries({ queryKey: ['matches'] });
            } else {
                toast.success('Solicitud rechazada');
            }
            queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Error al responder solicitud';
            toast.error(message);
        },
    });

    // Cancel service request (client)
    const cancelRequestMutation = useMutation({
        mutationFn: async (requestId: string) => {
            return api.delete(`/service-requests/${requestId}`);
        },
        onSuccess: () => {
            toast.success('Solicitud cancelada');
            queryClient.invalidateQueries({ queryKey: ['serviceRequests'] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Error al cancelar solicitud';
            toast.error(message);
        },
    });

    // Get request by ID
    const getRequestById = async (requestId: string): Promise<ServiceRequest | null> => {
        try {
            const response = await api.get<ServiceRequest>(`/service-requests/${requestId}`);
            return response;
        } catch (error) {
            console.error('Error fetching request:', error);
            return null;
        }
    };

    // Check if user has pending request for a service
    const hasPendingRequest = (serviceId: string): boolean => {
        return myRequests.some(
            (req) => req.service_id === serviceId && req.status === 'pending'
        );
    };

    // Get request for a service
    const getRequestForService = (serviceId: string): ServiceRequest | undefined => {
        return myRequests.find((req) => req.service_id === serviceId);
    };

    return {
        // Data
        myRequests,
        incomingRequests,
        isLoadingRequests,
        isLoadingIncoming,

        // Mutations
        createRequest: createRequestMutation.mutate,
        respondToRequest: respondToRequestMutation.mutate,
        cancelRequest: cancelRequestMutation.mutate,

        // Mutation states
        isCreating: createRequestMutation.isPending,
        isResponding: respondToRequestMutation.isPending,
        isCanceling: cancelRequestMutation.isPending,

        // Helpers
        getRequestById,
        hasPendingRequest,
        getRequestForService,
        refetchRequests,
        refetchIncoming,
    };
}

/**
 * Hook for checking if user has access to service contact info
 */
export function useServiceAccess(serviceId: string) {
    const { data: hasMatch = false } = useQuery({
        queryKey: ['serviceAccess', serviceId],
        queryFn: async () => {
            try {
                const response = await api.get<{ hasMatch: boolean }>(
                    `/services/${serviceId}/access`
                );
                return response.hasMatch;
            } catch {
                return false;
            }
        },
        staleTime: 5 * 60 * 1000,
    });

    return { hasMatch };
}
