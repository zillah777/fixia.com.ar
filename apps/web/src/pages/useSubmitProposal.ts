import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProposalData {
  coverLetter: string;
  proposedBudget: number;
  deliveryTime: string;
  questions: string;
  opportunityId: string;
}

/**
 * Simula una llamada a la API para enviar una propuesta.
 * En una aplicación real, esto haría una petición POST a un endpoint del backend.
 */
const sendProposal = async (proposalData: ProposalData) => {
  console.log("Enviando propuesta a la API:", proposalData);
  // Simula la latencia de la red
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simula un posible error para presupuestos muy bajos
  if (proposalData.proposedBudget < 100) {
    throw new Error("El presupuesto propuesto es demasiado bajo.");
  }

  // Simula una respuesta exitosa de la API
  return { success: true, message: "¡Propuesta enviada correctamente!" };
};

export const useSubmitProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendProposal,
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalida la query de 'opportunities' para que se actualice la lista.
      // Esto es útil para, por ejemplo, actualizar el contador de propuestas.
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
    onError: (error) => {
      toast.error(`Error al enviar la propuesta: ${error.message}`);
    },
  });
};