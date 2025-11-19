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
    createdAt: string;
    updatedAt: string;
}

export const verificationService = {
    async getVerificationGuide(type: VerificationType): Promise<VerificationGuide> {
        return {
            title: 'Verificación de ' + type,
            description: 'Guía de verificación',
            requirements: ['Requisito 1', 'Requisito 2'],
            documents: ['Documento 1', 'Documento 2'],
            processingTime: '1-3 días hábiles',
            tips: ['Tip 1', 'Tip 2']
        };
    },

    async createVerificationRequest(data: CreateVerificationRequestDto, files: File[]): Promise<VerificationRequest> {
        const formData = new FormData();
        formData.append('verificationType', data.verificationType);
        if (data.notes) formData.append('notes', data.notes);
        if (data.additionalInfo) formData.append('additionalInfo', JSON.stringify(data.additionalInfo));
        files.forEach((file) => formData.append('files', file));
        return api.post<VerificationRequest>('/verifications', formData);
    },

    isInstantVerification(type: VerificationType): boolean {
        return type === VerificationType.PHONE || type === VerificationType.EMAIL;
    },

    async getMyVerifications(): Promise<VerificationRequest[]> {
        return api.get<VerificationRequest[]>('/verifications/my-verifications');
    },

    getEstimatedProcessingTime(type: VerificationType): string {
        if (type === VerificationType.IDENTITY) return '1-2 días hábiles';
        if (type === VerificationType.SKILLS) return '3-5 días hábiles';
        if (type === VerificationType.BUSINESS) return '5-7 días hábiles';
        if (type === VerificationType.BACKGROUND_CHECK) return '7-10 días hábiles';
        if (type === VerificationType.ADDRESS) return '2-3 días hábiles';
        if (type === VerificationType.PHONE) return 'Instantáneo';
        if (type === VerificationType.EMAIL) return 'Instantáneo';
        return '3-5 días hábiles';
    },

    async cancelVerificationRequest(requestId: string): Promise<void> {
        return api.delete('/verifications/' + requestId);
    },

    getVerificationTypeLabel(type: VerificationType): string {
        if (type === VerificationType.IDENTITY) return 'Identidad';
        if (type === VerificationType.SKILLS) return 'Habilidades';
        if (type === VerificationType.BUSINESS) return 'Negocio';
        if (type === VerificationType.BACKGROUND_CHECK) return 'Antecedentes';
        if (type === VerificationType.ADDRESS) return 'Dirección';
        if (type === VerificationType.PHONE) return 'Teléfono';
        if (type === VerificationType.EMAIL) return 'Email';
        return type;
    },

    getVerificationStatusColor(status: VerificationStatus): string {
        if (status === VerificationStatus.PENDING) return 'text-warning';
        if (status === VerificationStatus.APPROVED) return 'text-success';
        if (status === VerificationStatus.REJECTED) return 'text-destructive';
        if (status === VerificationStatus.EXPIRED) return 'text-muted-foreground';
        if (status === VerificationStatus.CANCELLED) return 'text-muted-foreground';
        return 'text-muted-foreground';
    },

    getVerificationStatusLabel(status: VerificationStatus): string {
        if (status === VerificationStatus.PENDING) return 'Pendiente';
        if (status === VerificationStatus.APPROVED) return 'Aprobado';
        if (status === VerificationStatus.REJECTED) return 'Rechazado';
        if (status === VerificationStatus.EXPIRED) return 'Expirado';
        if (status === VerificationStatus.CANCELLED) return 'Cancelado';
        return status;
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
