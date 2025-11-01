import { api } from '../api';

export interface VerificationRequest {
  id: string;
  userId: string;
  verificationType: VerificationType;
  status: VerificationStatus;
  documents: string[];
  additionalInfo?: Record<string, any>;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    userType: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export enum VerificationType {
  IDENTITY = 'identity',
  SKILLS = 'skills',
  BUSINESS = 'business',
  BACKGROUND_CHECK = 'background_check',
  PHONE = 'phone',
  EMAIL = 'email',
  ADDRESS = 'address'
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface CreateVerificationRequestDto {
  verificationType: VerificationType;
  documents?: string[];
  additionalInfo?: Record<string, any>;
  notes?: string;
}

export interface UpdateVerificationRequestDto {
  documents?: string[];
  additionalInfo?: Record<string, any>;
  notes?: string;
}

export interface VerificationStatus {
  verifiedIdentity: boolean;
  verifiedSkills: boolean;
  verifiedBusiness: boolean;
  backgroundChecked: boolean;
  verifiedPhone: boolean;
  verifiedEmail: boolean;
  verifiedAddress: boolean;
  verificationRequests: VerificationRequest[];
  overallVerificationScore: number;
}

export interface VerificationGuide {
  title: string;
  description: string;
  requirements: string[];
  documents: string[];
  processingTime: string;
  tips: string[];
}

export interface VerificationStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  byType: Record<VerificationType, {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>;
}

class VerificationService {
  async createVerificationRequest(
    data: CreateVerificationRequestDto,
    files?: File[]
  ): Promise<VerificationRequest> {
    const formData = new FormData();
    
    // Add form fields
    formData.append('verificationType', data.verificationType);
    if (data.notes) formData.append('notes', data.notes);
    if (data.additionalInfo) {
      formData.append('additionalInfo', JSON.stringify(data.additionalInfo));
    }
    if (data.documents) {
      formData.append('documents', JSON.stringify(data.documents));
    }

    // Add files
    if (files) {
      files.forEach(file => {
        formData.append('documents', file);
      });
    }

    const response = await api.post('/verification/request', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.request;
  }

  async getMyVerificationRequests(): Promise<VerificationRequest[]> {
    const response = await api.get('/verification/my-requests');
    return response.data.requests;
  }

  async getMyVerificationStatus(): Promise<VerificationStatus> {
    const response = await api.get('/verification/status');
    return response.data;
  }

  async getVerificationGuide(type: VerificationType): Promise<VerificationGuide> {
    const response = await api.get(`/verification/guide/${type}`);
    return response.data;
  }

  async getVerificationRequest(id: string): Promise<VerificationRequest> {
    const response = await api.get(`/verification/request/${id}`);
    return response.data.request;
  }

  async updateVerificationRequest(
    id: string,
    data: UpdateVerificationRequestDto,
    files?: File[]
  ): Promise<VerificationRequest> {
    const formData = new FormData();
    
    // Add form fields
    if (data.notes) formData.append('notes', data.notes);
    if (data.additionalInfo) {
      formData.append('additionalInfo', JSON.stringify(data.additionalInfo));
    }
    if (data.documents) {
      formData.append('documents', JSON.stringify(data.documents));
    }

    // Add files
    if (files) {
      files.forEach(file => {
        formData.append('documents', file);
      });
    }

    const response = await api.put(`/verification/request/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.request;
  }

  async cancelVerificationRequest(id: string): Promise<void> {
    await api.delete(`/verification/request/${id}`);
  }

  // Instant verification methods
  async initiatePhoneVerification(phoneNumber: string): Promise<{ message: string; verificationCode?: string }> {
    const response = await api.post('/verification/phone', { phoneNumber });
    return response.data;
  }

  async verifyPhone(phoneNumber: string, verificationCode: string): Promise<{ message: string; verified: boolean }> {
    const response = await api.post('/verification/phone/verify', {
      phoneNumber,
      verificationCode
    });
    return response.data;
  }

  async sendEmailVerification(): Promise<{ message: string; verificationToken?: string }> {
    const response = await api.post('/verification/email/send');
    return response.data;
  }

  async verifyEmail(verificationToken: string): Promise<{ message: string; verified: boolean }> {
    const response = await api.post('/verification/email/verify', { verificationToken });
    return response.data;
  }

  async submitAddressVerification(address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    documents?: string[];
  }): Promise<VerificationRequest> {
    const response = await api.post('/verification/address', address);
    return response.data.request;
  }

  // Admin methods
  async getPendingVerificationRequests(
    page = 1,
    limit = 20,
    verificationType?: VerificationType
  ): Promise<{
    requests: VerificationRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (verificationType) params.append('verificationType', verificationType);

    const response = await api.get(`/verification/admin/pending?${params.toString()}`);
    return response.data;
  }

  async reviewVerificationRequest(
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
    notes?: string
  ): Promise<VerificationRequest> {
    const response = await api.post(`/verification/admin/review/${id}`, {
      status,
      rejectionReason,
      notes
    });
    return response.data.request;
  }

  async getVerificationStats(): Promise<VerificationStats> {
    const response = await api.get('/verification/admin/stats');
    return response.data;
  }

  // Helper methods
  getVerificationTypeLabel(type: VerificationType): string {
    const labels = {
      [VerificationType.IDENTITY]: 'Verificación de Identidad',
      [VerificationType.SKILLS]: 'Verificación de Habilidades',
      [VerificationType.BUSINESS]: 'Verificación de Negocio',
      [VerificationType.BACKGROUND_CHECK]: 'Verificación de Antecedentes',
      [VerificationType.PHONE]: 'Verificación de Teléfono',
      [VerificationType.EMAIL]: 'Verificación de Email',
      [VerificationType.ADDRESS]: 'Verificación de Dirección'
    };
    return labels[type] || type;
  }

  getVerificationStatusLabel(status: VerificationStatus): string {
    const labels = {
      [VerificationStatus.PENDING]: 'Pendiente',
      [VerificationStatus.APPROVED]: 'Aprobado',
      [VerificationStatus.REJECTED]: 'Rechazado',
      [VerificationStatus.EXPIRED]: 'Expirado',
      [VerificationStatus.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  getVerificationStatusColor(status: VerificationStatus): string {
    const colors = {
      [VerificationStatus.PENDING]: 'text-warning bg-warning/10',
      [VerificationStatus.APPROVED]: 'text-success bg-success/10',
      [VerificationStatus.REJECTED]: 'text-destructive bg-destructive/10',
      [VerificationStatus.EXPIRED]: 'text-gray-600 bg-gray-100',
      [VerificationStatus.CANCELLED]: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  isInstantVerification(type: VerificationType): boolean {
    return [VerificationType.PHONE, VerificationType.EMAIL].includes(type);
  }

  getVerificationPriority(type: VerificationType): number {
    const priorities = {
      [VerificationType.IDENTITY]: 1,
      [VerificationType.PHONE]: 2,
      [VerificationType.EMAIL]: 3,
      [VerificationType.SKILLS]: 4,
      [VerificationType.ADDRESS]: 5,
      [VerificationType.BUSINESS]: 6,
      [VerificationType.BACKGROUND_CHECK]: 7
    };
    return priorities[type] || 99;
  }

  getEstimatedProcessingTime(type: VerificationType): string {
    const times = {
      [VerificationType.PHONE]: 'Inmediato',
      [VerificationType.EMAIL]: 'Inmediato',
      [VerificationType.IDENTITY]: '1-3 días hábiles',
      [VerificationType.ADDRESS]: '2-5 días hábiles',
      [VerificationType.SKILLS]: '3-7 días hábiles',
      [VerificationType.BUSINESS]: '5-10 días hábiles',
      [VerificationType.BACKGROUND_CHECK]: '7-14 días hábiles'
    };
    return times[type] || 'Variable';
  }
}

export const verificationService = new VerificationService();