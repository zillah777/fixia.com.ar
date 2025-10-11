import { api } from '../api';

export interface DashboardStats {
  total_services: number;
  active_projects: number;
  total_earnings: number;
  average_rating: number;
  review_count: number;
  profile_views: number;
  messages_count: number;
  pending_proposals: number;
  stats_change?: {
    earnings_change?: string;
    projects_change?: string;
    views_change?: string;
    rating_change?: string;
  };
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'message' | 'review' | 'proposal' | 'payment' | 'service_created' | 'profile_view';
  title: string;
  description: string;
  time: string;
  created_at: string;
  status?: string;
  metadata?: any;
}

export interface CurrentProject {
  id: string;
  title: string;
  client_name: string;
  progress: number;
  deadline: string;
  status: 'not_started' | 'in_progress' | 'milestone_review' | 'completed' | 'cancelled';
  price: number;
  currency: string;
}

class DashboardService {
  /**
   * Get dashboard statistics for the current user
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get recent activity for the current user
   */
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await api.get('/dashboard/activity', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  /**
   * Get current active projects
   */
  async getCurrentProjects(limit: number = 5): Promise<CurrentProject[]> {
    try {
      const response = await api.get('/dashboard/projects', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current projects:', error);
      throw error;
    }
  }

  /**
   * Format activity timestamp to relative time
   */
  formatActivityTime(timestamp: string): string {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;

    return activityDate.toLocaleDateString('es-AR');
  }

  /**
   * Get activity icon and color based on type
   */
  getActivityMeta(type: RecentActivity['type']): { icon: string; color: string } {
    const meta: Record<RecentActivity['type'], { icon: string; color: string }> = {
      order: { icon: 'DollarSign', color: 'text-success' },
      message: { icon: 'MessageSquare', color: 'text-primary' },
      review: { icon: 'Award', color: 'text-warning' },
      proposal: { icon: 'FileText', color: 'text-info' },
      payment: { icon: 'CreditCard', color: 'text-success' },
      service_created: { icon: 'Plus', color: 'text-primary' },
      profile_view: { icon: 'Eye', color: 'text-muted-foreground' }
    };

    return meta[type] || { icon: 'Bell', color: 'text-muted-foreground' };
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'ARS'): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Get project status label
   */
  getProjectStatusLabel(status: CurrentProject['status']): string {
    const labels: Record<CurrentProject['status'], string> = {
      not_started: 'No iniciado',
      in_progress: 'En progreso',
      milestone_review: 'En revisión',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };

    return labels[status] || status;
  }

  /**
   * Get project status color
   */
  getProjectStatusColor(status: CurrentProject['status']): string {
    const colors: Record<CurrentProject['status'], string> = {
      not_started: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      milestone_review: 'bg-yellow-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };

    return colors[status] || 'bg-gray-500';
  }
}

export const dashboardService = new DashboardService();
