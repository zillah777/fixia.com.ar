import { useQuery } from '@tanstack/react-query';
import { MessageSquare, CheckCircle, Star, DollarSign } from 'lucide-react';

export interface Activity {
    id: string;
    title: string;
    description: string;
    time: string;
    icon: any;
    color: string;
    status?: 'new' | 'read';
}

const mockActivities: Activity[] = [
    {
        id: '1',
        title: 'Nueva propuesta recibida',
        description: 'Juan Pérez envió una propuesta para tu proyecto de diseño web',
        time: 'Hace 2 horas',
        icon: MessageSquare,
        color: 'text-blue-400',
        status: 'new'
    },
    {
        id: '2',
        title: 'Proyecto completado',
        description: 'El proyecto "Desarrollo de App Móvil" ha sido marcado como completado',
        time: 'Hace 5 horas',
        icon: CheckCircle,
        color: 'text-success',
        status: 'read'
    },
    {
        id: '3',
        title: 'Nueva reseña',
        description: 'María García dejó una reseña de 5 estrellas en tu servicio',
        time: 'Hace 1 día',
        icon: Star,
        color: 'text-warning',
        status: 'read'
    },
    {
        id: '4',
        title: 'Pago recibido',
        description: 'Has recibido un pago de $15,000 por el proyecto completado',
        time: 'Hace 2 días',
        icon: DollarSign,
        color: 'text-success',
        status: 'read'
    }
];

export const useRecentActivity = () => {
    return useQuery<Activity[]>({
        queryKey: ['recentActivity'],
        queryFn: async () => {
            // Simular llamada a API
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockActivities;
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
};
