import { useQuery } from "@tanstack/react-query";
import { mockOpportunities } from "../pages/OpportunitiesPage";

interface Filters {
  searchQuery: string;
  selectedCategory: string;
  budgetRange: number[];
  sortBy: string;
  urgencyFilter: string[];
  locationFilter: string;
}

/**
 * Simula una llamada a la API para obtener y filtrar oportunidades.
 * En una aplicación real, esto haría una petición a un endpoint del backend
 * pasando los filtros como query params.
 */
const fetchOpportunities = async (filters: Filters) => {
  console.log("Fetching opportunities with filters:", filters);
  // Simula la latencia de la red
  await new Promise(resolve => setTimeout(resolve, 500));

  let filtered = mockOpportunities;

  // Lógica de filtrado
  if (filters.selectedCategory !== "Todos") {
    filtered = filtered.filter(opp => opp.category === filters.selectedCategory);
  }

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(opp =>
      opp.title.toLowerCase().includes(query) ||
      opp.description.toLowerCase().includes(query) ||
      opp.skills.some(skill => skill.toLowerCase().includes(query))
    );
  }

  filtered = filtered.filter(opp =>
    opp.budget.min >= filters.budgetRange[0] && opp.budget.max <= filters.budgetRange[1]
  );

  if (filters.locationFilter !== "all") {
    if (filters.locationFilter === "remote") {
      filtered = filtered.filter(opp => opp.location === "Remoto");
    }
    // Aquí se podría añadir lógica para 'local' e 'híbrido' si los datos lo permitieran
  }

  // Lógica de ordenamiento
  switch (filters.sortBy) {
    case "budget_desc":
      filtered.sort((a, b) => b.budget.max - a.budget.max);
      break;
    case "proposals_asc":
      filtered.sort((a, b) => a.proposals - b.proposals);
      break;
    case "deadline":
      filtered.sort((a, b) => {
        if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
        if (b.urgency === 'urgent' && a.urgency !== 'urgent') return 1;
        return 0; // Simplificado, se podría mejorar para parsear fechas
      });
      break;
    case "client_rating":
      filtered.sort((a, b) => b.client.rating - a.client.rating);
      break;
    default: // "newest"
      // El mock data ya está más o menos en este orden, no se hace nada.
      break;
  }

  return filtered;
};

export const useOpportunities = (filters: Filters) => {
  return useQuery({
    // La queryKey incluye los filtros para que React Query cachee los resultados
    // y vuelva a hacer fetch automáticamente si cambian.
    queryKey: ['opportunities', filters],
    queryFn: () => fetchOpportunities(filters),
    placeholderData: (previousData) => previousData, // Muestra datos antiguos mientras carga los nuevos
  });
};