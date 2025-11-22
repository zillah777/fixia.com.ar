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

/**
 * UpdateProfileRequest - Only includes fields supported by backend UpdateProfileDto
 *
 * IMPORTANT: The following fields are NOT supported by the backend:
 * - lastName (backend only has 'name' for full name)
 * - address (use 'location' instead)
 * - birthDate (only set during registration)
 * - province, city (use 'location' instead for combined location string)
 * - dni, matricula, cuitCuil (only set during registration)
 * - isMonotributista (not in backend DTO)
 */
export interface UpdateProfileRequest {
  // Basic profile fields
  name?: string;
  avatar?: string;
  location?: string;  // Combined location (e.g., "Rawson, Chubut")
  phone?: string;
  bio?: string;

  // Professional specialties
  specialties?: string[];

  // Contact information
  whatsapp_number?: string;

  // Social networks
  social_linkedin?: string;
  social_twitter?: string;
  social_facebook?: string;
  social_instagram?: string;

  // Notification preferences
  notifications_messages?: boolean;
  notifications_orders?: boolean;
  notifications_projects?: boolean;
  notifications_newsletter?: boolean;

  // Timezone
  timezone?: string;
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
    // Backend uses DELETE /user/profile for account deletion (soft delete)
    return api.delete('/user/profile');
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