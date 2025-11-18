import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Briefcase, Users, Award } from "lucide-react";
import { DollarSign, MessageSquare, Star } from "lucide-react";

// --- Mock Data (extraído de DashboardPage.tsx) ---

const mockStats = [
  {
    title: "Ingresos del Mes",
    value: "$3,247",
    change: "+12.3%",
    changeType: "positive",
    icon: TrendingUp,
    description: "vs. mes anterior"
  },
  {
    title: "Servicios Activos",
    value: "8",
    change: "+2",
    changeType: "positive", 
    icon: Briefcase,
    description: "servicios publicados"
  },
  {
    title: "Clientes Satisfechos",
    value: "156",
    change: "+8",
    changeType: "positive",
    icon: Users,
    description: "proyectos completados"
  },
  {
    title: "Rating Promedio",
    value: "4.9",
    change: "+0.2",
    changeType: "positive",
    icon: Award,
    description: "de 187 reseñas"
  }
];

const mockProjects = [
  {
    id: 1,
    title: "E-commerce para ModaStyle",
    client: "Ana García",
    deadline: "En 5 días",
    progress: 75,
    status: "in_progress",
    priority: "high"
  },
  {
    id: 2,
    title: "App Móvil FitTracker",
    client: "Roberto Silva",
    deadline: "En 12 días",
    progress: 45,
    status: "in_progress",
    priority: "normal"
  },
  {
    id: 3,
    title: "Branding TechVision",
    client: "María López",
    deadline: "En 8 días",
    progress: 90,
    status: "review",
    priority: "normal"
  }
];

const mockActivities = [
  {
    id: 1,
    type: 'order',
    title: 'Nuevo pedido recibido',
    description: 'Desarrollo E-commerce - Cliente: TechStart',
    time: 'Hace 2 horas',
    status: 'new',
    icon: DollarSign,
    color: 'text-success'
  },
  {
    id: 2,
    type: 'message',
    title: 'Mensaje de cliente',
    description: 'Carlos Mendoza envió una consulta',
    time: 'Hace 5 horas',
    status: 'unread',
    icon: MessageSquare,
    color: 'text-primary'
  },
  {
    id: 3,
    type: 'review',
    title: 'Nueva reseña recibida',
    description: '5 estrellas - "Excelente trabajo"',
    time: 'Ayer',
    status: 'completed',
    icon: Star,
    color: 'text-warning'
  }
];

// --- Fetch Functions ---

const fetchDashboardStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 700));
  return mockStats;
};

const fetchCurrentProjects = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockProjects;
};

// --- Hooks ---

export const useDashboardStats = () => useQuery({ queryKey: ['dashboardStats'], queryFn: fetchDashboardStats });
export const useCurrentProjects = () => useQuery({ queryKey: ['currentProjects'], queryFn: fetchCurrentProjects });
export const useRecentActivity = () => useQuery({ queryKey: ['recentActivity'], queryFn: () => Promise.resolve(mockActivities) });