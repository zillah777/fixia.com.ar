import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Briefcase, Users, Award, DollarSign, MessageSquare, Star } from "lucide-react";
import { usersService } from "../lib/services/users.service";
import { projectsService } from "../lib/services/projects.service";

// --- Mappers ---

const mapStats = (data: any) => [
  {
    title: "Ingresos Totales",
    value: `$${data.total_earnings || 0}`,
    change: "+0%", // Backend doesn't provide change yet
    changeType: "neutral",
    icon: TrendingUp,
    description: "Total acumulado"
  },
  {
    title: "Servicios/Proyectos",
    value: `${data.total_services || 0}`,
    change: "Activos",
    changeType: "neutral",
    icon: Briefcase,
    description: "En curso"
  },
  {
    title: "Interacciones",
    value: `${data.messages_count || 0}`,
    change: "Mensajes",
    changeType: "neutral",
    icon: MessageSquare,
    description: "Total mensajes"
  },
  {
    title: "Calificación",
    value: `${data.average_rating || 0}`,
    change: `${data.review_count || 0} reseñas`,
    changeType: "positive",
    icon: Award,
    description: "Promedio general"
  }
];

// --- Fetch Functions ---

const fetchDashboardStats = async () => {
  const data = await usersService.getDashboardStats();
  return mapStats(data);
};

const fetchCurrentProjects = async () => {
  // Fetch real projects from the API
  // We use 'in_progress' status to get active projects
  const projects = await projectsService.getMyProjects('in_progress');

  // Map to the format expected by the dashboard component
  return projects.map(p => ({
    id: p.id,
    title: p.title,
    client: p.client?.name || 'Cliente',
    deadline: p.deadline ? new Date(p.deadline).toLocaleDateString() : 'Sin fecha',
    progress: 0, // Backend doesn't track progress percentage yet
    status: p.status,
    priority: p.priority || 'normal'
  }));
};

const fetchRecentActivity = async () => {
  // For now, we'll keep this mocked or implement a real activity log endpoint later
  // as it requires a dedicated ActivityService on the backend
  return [
    {
      id: 1,
      type: 'system',
      title: 'Bienvenido a Fixia',
      description: 'Tu panel de control está listo',
      time: 'Ahora',
      status: 'new',
      icon: Star,
      color: 'text-primary'
    }
  ];
};

// --- Hooks ---

export const useDashboardStats = () => useQuery({
  queryKey: ['dashboardStats'],
  queryFn: fetchDashboardStats,
  retry: 1
});

export const useCurrentProjects = () => useQuery({
  queryKey: ['currentProjects'],
  queryFn: fetchCurrentProjects,
  retry: 1
});

export const useRecentActivity = () => useQuery({
  queryKey: ['recentActivity'],
  queryFn: fetchRecentActivity
});