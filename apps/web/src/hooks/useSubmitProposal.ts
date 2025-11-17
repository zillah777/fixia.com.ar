import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ProposalData {
  opportunityId: string;
  coverLetter: string;
  proposedBudget: number;
  deliveryTime: string;
  questions?: string;
}

export function useSubmitProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProposalData) => {
      // Mock implementation - in real app this would call an API
      console.log('Submitting proposal:', data);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success/failure randomly
      if (Math.random() > 0.1) { // 90% success rate
        return { success: true, message: 'Proposal submitted successfully' };
      } else {
        throw new Error('Failed to submit proposal');
      }
    },
    onSuccess: (data, variables) => {
      toast.success('Propuesta enviada correctamente');

      // Invalidate and refetch opportunities to update proposal counts
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
    onError: (error) => {
      toast.error('Error al enviar la propuesta. Inténtalo de nuevo.');
      console.error('Proposal submission error:', error);
    },
  });
}