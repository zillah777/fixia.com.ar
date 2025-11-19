import { api } from '../api';

export enum VerificationType {
    IDENTITY = 'identity',
    SKILLS = 'skills',
    BUSINESS = 'business',
    BACKGROUND_CHECK = 'background_check',
    ADDRESS = 'address',
    PHONE = 'phone',
    EMAIL = 'email'
}

export enum VerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled'
}

export interface VerificationGuide {
    title: string;
    description: string;
    requirements: string[];
    documents: string[];
    processingTime: string;
    tips: string[];
}

export interface CreateVerificationRequestDto {
    verificationType: VerificationType;
    notes?: string;
    additionalInfo?: Record<string, any>;
}

export interface VerificationRequest {
    id: string;
    userId: string;
    verificationType: VerificationType;
    status: VerificationStatus;
    notes?: string;
    additionalInfo?: Record<string, any>;
    documents?: string[];
    reviewedAt?: string;
    rejectionReason?: string;
    reviewer?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface VerificationStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export const verificationService = {
    async getVerificationGuide(type: VerificationType): Promise<VerificationGuide> {
        return {
            title: `Verificación de ${type}`,
            description: 'Guía de verificación',
            requirements: ['Requisito 1', 'Requisito 2'],
            documents: ['Documento 1', 'Documento 2'],
            processingTime: '1-3 días hábiles',
            tips: ['Tip 1', 'Tip 2']
        };
    },

    async createVerificationRequest(
        data: CreateVerificationRequestDto,
        files: File[]
    ): Promise<VerificationRequest> {
        const formData = new FormData();
        formData.append('verificationType', data.verificationType);
        if (data.notes) formData.append('notes', data.notes);
        if (data.additionalInfo) {
            formData.append('additionalInfo', JSON.stringify(data.additionalInfo));
        }
        files.forEach((file) => formData.append('files', file));
        return api.post<VerificationRequest>('/verifications', formData);
    },

    isInstantVerification(type: VerificationType): boolean {
        return type === VerificationType.PHONE || type === VerificationType.EMAIL;
    },

    async getMyVerifications(): Promise<VerificationRequest[]> {
        return api.get<VerificationRequest[]>('/verifications/my-verifications');
    },

    async getMyVerificationStatus(): Promise<any> {
        return api.get('/verifications/status');
    },

    async getMyVerificationRequests(): Promise<VerificationRequest[]> {
        return this.getMyVerifications();
    },

    async getPendingVerificationRequests(): Promise<VerificationRequest[]> {
        return api.get<VerificationRequest[]>('/verifications/pending');
    },

    async getVerificationStats(): Promise<VerificationStats> {
        return api.get<VerificationStats>('/verifications/stats');
    },

    async reviewVerificationRequest(
        requestId: string,
        approved: boolean,
        rejectionReason?: string
    ): Promise<void> {
        return api.post(`/verifications/${requestId}/review`, {
            approved,
            rejectionReason
        });
    },

    getEstimatedProcessingTime(type: VerificationType): string {
        const times: Record<VerificationType, string> = {
            [VerificationType.IDENTITY]: '1-2 días hábiles',
            [VerificationType.SKILLS]: '3-5 días hábiles',
            [VerificationType.BUSINESS]: '5-7 días hábiles',
            [VerificationType.BACKGROUND_CHECK]: '7-10 días hábiles',
            [VerificationType.ADDRESS]: '2-3 días hábiles',
            [VerificationType.PHONE]: 'Instantáneo',
            [VerificationType.EMAIL]: 'Instantáneo'
        };
        return times[type] || '3-5 días hábiles';
    },

    async cancelVerificationRequest(requestId: string): Promise<void> {
        return api.delete(`/verifications/${requestId}`);
    },

    getVerificationTypeLabel(type: VerificationType): string {
        const labels: Record<VerificationType, string> = {
            [VerificationType.IDENTITY]: 'Identidad',
            [VerificationType.SKILLS]: 'Habilidades',
            [VerificationType.BUSINESS]: 'Negocio',
            [VerificationType.BACKGROUND_CHECK]: 'Antecedentes',
            [VerificationType.ADDRESS]: 'Dirección',
            [VerificationType.PHONE]: 'Teléfono',
            [VerificationType.EMAIL]: 'Email'
        };
        return labels[type] || type;
    },

    getVerificationStatusColor(status: VerificationStatus): string {
        const colors: Record<VerificationStatus, string> = {
            [VerificationStatus.PENDING]: 'text-warning',
            [VerificationStatus.APPROVED]: 'text-success',
            [VerificationStatus.REJECTED]: 'text-destructive',
            [VerificationStatus.EXPIRED]: 'text-muted-foreground',
            [VerificationStatus.CANCELLED]: 'text-muted-foreground'
        };
        return colors[status] || 'text-muted-foreground';
    },

    getVerificationStatusLabel(status: VerificationStatus): string {
        const labels: Record<VerificationStatus, string> = {
            [VerificationStatus.PENDING]: 'Pendiente',
            [VerificationStatus.APPROVED]: 'Aprobado',
            [VerificationStatus.REJECTED]: 'Rechazado',
            [VerificationStatus.EXPIRED]: 'Expirado',
            [VerificationStatus.CANCELLED]: 'Cancelado'
        };
        return labels[status] || status;
    },

    async sendPhoneVerification(phone: string): Promise<void> {
        return api.post('/verifications/phone/send', { phone });
    },

    async sendEmailVerification(email: string): Promise<void> {
        return api.post('/verifications/email/send', { email });
    },

    async verifyPhone(phone: string, code: string): Promise<void> {
        return api.post('/verifications/phone/verify', { phone, code });
    },

    async verifyEmail(email: string, code: string): Promise<void> {
        return api.post('/verifications/email/verify', { email, code });
    }
};

export default verificationService;
