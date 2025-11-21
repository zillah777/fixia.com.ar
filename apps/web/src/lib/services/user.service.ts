import { api } from '../api';
import { User } from '../../context/SecureAuthContext';

export interface DashboardStats {
  total_services: number;
  active_projects: number;
  total_earnings: number;
  average_rating: number;
  review_count: number;
  profile_views: number;
  messages_count: number;
  pending_proposals: number;
}

export interface ContactRequest {
  id: string;
  from: User;
  to: User;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  avatar?: string;
  // Professional specific fields
  dni?: string;
  matricula?: string;
  cuitCuil?: string;
  serviceCategories?: string[];
  availability?: 'available' | 'busy' | 'offline';
  province?: string;
  city?: string;
  isMonotributista?: boolean;
}

export const userService = {
  async getProfile(): Promise<User> {
    return api.get<User>('/user/profile');
  },

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    return api.put<User>('/user/profile', profileData);
  },

  async getDashboard(): Promise<DashboardStats> {
    return api.get<DashboardStats>('/user/dashboard');
  },

  async getContactRequests(): Promise<ContactRequest[]> {
    return api.get<ContactRequest[]>('/user/contact-requests');
  },

  async sendContactRequest(professionalId: string, message: string): Promise<ContactRequest> {
    return api.post<ContactRequest>('/user/contact-requests', {
      professionalId,
      message
    });
  },

  async respondToContactRequest(requestId: string, accept: boolean, message?: string): Promise<ContactRequest> {
    return api.patch<ContactRequest>(`/user/contact-requests/${requestId}`, {
      accept,
      message
    });
  },

  async updateAvailability(status: 'available' | 'busy' | 'offline'): Promise<User> {
    return api.patch<User>('/user/availability', { status });
  },

  async upgradeToPremium(): Promise<{ paymentUrl: string }> {
    return api.post<{ paymentUrl: string }>('/user/upgrade-premium');
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return api.post<{ avatarUrl: string }>('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async deleteAccount(): Promise<void> {
    return api.delete('/user/account');
  },

  async exportData(): Promise<Blob> {
    return api.get('/user/export-data', {
      responseType: 'blob',
    });
  },

  async getActiveProfessionalsCount(): Promise<{ count: number }> {
    return api.get<{ count: number }>('/professionals/count');
  },

  async getPublicProfile(userId: string): Promise<User> {
    return api.get<User>(`/users/${userId}`);
  },
};

export default userService;