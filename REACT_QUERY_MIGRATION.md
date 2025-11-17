# PLAN DE MIGRACIÓN A REACT QUERY (TanStack Query)

**Fecha:** 2025-11-16
**Autor:** Gemini Code Assist

## 1. Objetivo

Migrar el manejo de estado del servidor (data fetching) de la aplicación web de `useState` y `useEffect` a React Query.

**Beneficios esperados:**
- **Reducción de código:** Eliminar la lógica manual de fetching, loading, y estados de error.
- **Cache inteligente:** Reducir peticiones de red innecesarias y mostrar datos cacheados al instante.
- **Actualización en segundo plano:** Mantener los datos frescos sin bloquear la UI (`stale-while-revalidate`).
- **Mejora de la UX:** Proporcionar una experiencia de usuario más rápida y fluida.
- **Gestión de mutaciones simplificada:** Facilitar la actualización, creación y borrado de datos con invalidación automática del cache.

## 2. Instalación de Dependencias

Ejecutar el siguiente comando en el directorio `apps/web`:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## 3. Plan de Implementación

### Paso 1: Configurar el `QueryClientProvider`

Envolver el componente raíz de la aplicación (probablemente en `src/main.tsx` o `src/App.tsx`) con el `QueryClientProvider`.

```tsx
// En src/main.tsx (ejemplo)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Paso 2: Identificar y Refactorizar Componentes

El primer candidato ideal es `OpportunitiesPage.tsx`. Actualmente, maneja el estado de los filtros y los datos con `useState` y un `useEffect` complejo.

**Estrategia:**
1.  **Crear un Custom Hook `useOpportunities`:** Este hook encapsulará la lógica de fetching y los filtros.
2.  **Utilizar `useQuery`:** Dentro de `useOpportunities`, `useQuery` se encargará de llamar a la API. La `queryKey` incluirá los filtros para que el cache se actualice automáticamente cuando cambien.
3.  **Refactorizar `OpportunitiesPage.tsx`:** Reemplazar el `useEffect` y los `useState` relacionados con los datos por la llamada al nuevo hook `useOpportunities`.

### Paso 3: Manejar Mutaciones

Para acciones como "Enviar Propuesta" (`ProposalForm.tsx`), se utilizará el hook `useMutation`.

**Ejemplo de mutación:**

```tsx
const { mutate, isPending } = useMutation({
  mutationFn: (newProposal) => api.proposals.create(newProposal),
  onSuccess: () => {
    // Invalidar la query de oportunidades para que se actualice el contador de propuestas
    queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    toast.success("¡Propuesta enviada!");
  },
  onError: (error) => {
    toast.error("Error al enviar la propuesta.");
  }
});
```

### Paso 4: Extender a toda la aplicación

Replicar el patrón de custom hooks (`useEntity`) y `useMutation` para todas las demás entidades de la aplicación (perfiles, proyectos, matches, etc.).

## 4. Manejo de Estados en la UI

`useQuery` no solo devuelve `data`, sino también estados que simplifican la UI.

```tsx
function OpportunitiesList() {
  const { data, isLoading, isError, error } = useOpportunities(filters);

  if (isLoading) {
    return <Spinner />; // Muestra un indicador de carga
  }

  if (isError) {
    return <div>Error: {error.message}</div>; // Muestra un mensaje de error
  }

  return data.map(opp => <OpportunityCard key={opp.id} opportunity={opp} />);
}
```