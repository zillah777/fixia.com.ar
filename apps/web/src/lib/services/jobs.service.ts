import { api } from '../api';

export interface Job {
  id: string;
  project_id: string;
  client_id: string;
  professional_id: string;
  proposal_id: string;
  title: string;
  description: string;
  agreed_price: number;
  currency: string;
  delivery_date?: string;
  status: JobStatus;
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    name: string;
    email: string;
    whatsapp_number?: string;
  };
  professional: {
    id: string;
    name: string;
    email: string;
    whatsapp_number?: string;
  };
  project: {
    id: string;
    title: string;
    description: string;
  };
  proposal: {
    id: string;
    quoted_price: number;
    delivery_time_days: number;
  };
  milestones: JobMilestone[];
  status_updates: JobStatusUpdate[];
  payments: Payment[];
}

export interface JobMilestone {
  id: string;
  job_id: string;
  title: string;
  description?: string;
  amount: number;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  approved_by_client: boolean;
  approved_at?: string;
  created_at: string;
}

export interface JobStatusUpdate {
  id: string;
  job_id: string;
  status_from: JobStatus;
  status_to: JobStatus;
  message?: string;
  created_at: string;
  updated_by: {
    id: string;
    name: string;
  };
}

export interface Payment {
  id: string;
  job_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  transaction_id?: string;
  paid_at?: string;
  released_at?: string;
  refunded_at?: string;
  platform_fee?: number;
  professional_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactInteraction {
  id: string;
  client_id: string;
  professional_id: string;
  service_id?: string;
  project_id?: string;
  contact_method: string;
  message?: string;
  contact_data?: any;
  converted_to_job: boolean;
  job_id?: string;
  conversion_value?: number;
  created_at: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  professional: {
    id: string;
    name: string;
    email: string;
  };
  service?: {
    id: string;
    title: string;
    price: number;
  };
  project?: {
    id: string;
    title: string;
    budget_min?: number;
    budget_max?: number;
  };
}

export type JobStatus = 'not_started' | 'in_progress' | 'milestone_review' | 'completed' | 'cancelled' | 'disputed';
export type PaymentStatus = 'pending' | 'paid' | 'released' | 'refunded' | 'disputed';

export interface CreateJobDto {
  projectId: string;
  clientId: string;
  professionalId: string;
  proposalId: string;
  title: string;
  description: string;
  agreedPrice: number;
  currency?: string;
  deliveryDate?: string;
}

export interface UpdateJobStatusDto {
  status: JobStatus;
  progressPercentage?: number;
  message?: string;
}

export interface CreateMilestoneDto {
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
}

export interface CreateContactInteractionDto {
  professionalId: string;
  serviceId?: string;
  projectId?: string;
  contactMethod: string;
  message?: string;
  contactData?: any;
}

export interface JobStats {
  jobsByStatus: Record<JobStatus, number>;
  totalEarnings: number;
  totalJobs: number;
}

export interface ConversionAnalytics {
  totalContacts: number;
  convertedContacts: number;
  conversionRate: number;
  contactsByMethod: Record<string, number>;
}

class JobsService {
  // Job Management
  async createJob(createJobDto: CreateJobDto): Promise<Job> {
    const response = await api.post('/jobs', createJobDto);
    return response.data;
  }

  async getMyJobs(): Promise<Job[]> {
    const response = await api.get('/jobs/my-jobs');
    return response.data;
  }

  async getJobById(jobId: string): Promise<Job> {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  }

  async updateJobStatus(jobId: string, updateJobStatusDto: UpdateJobStatusDto): Promise<Job> {
    const response = await api.put(`/jobs/${jobId}/status`, updateJobStatusDto);
    return response.data;
  }

  // Milestones
  async createMilestone(jobId: string, createMilestoneDto: CreateMilestoneDto): Promise<JobMilestone> {
    const response = await api.post(`/jobs/${jobId}/milestones`, createMilestoneDto);
    return response.data;
  }

  async completeMilestone(milestoneId: string): Promise<JobMilestone> {
    const response = await api.put(`/jobs/milestones/${milestoneId}/complete`);
    return response.data;
  }

  async approveMilestone(milestoneId: string): Promise<JobMilestone> {
    const response = await api.put(`/jobs/milestones/${milestoneId}/approve`);
    return response.data;
  }

  // Contact Interactions
  async createContactInteraction(createContactInteractionDto: CreateContactInteractionDto): Promise<ContactInteraction> {
    const response = await api.post('/jobs/contacts', createContactInteractionDto);
    return response.data;
  }

  async getMyContacts(): Promise<ContactInteraction[]> {
    const response = await api.get('/jobs/contacts/my-contacts');
    return response.data;
  }

  async markContactAsConverted(contactId: string, jobId: string, conversionValue?: number): Promise<ContactInteraction> {
    const response = await api.put(`/jobs/contacts/${contactId}/convert`, {
      jobId,
      conversionValue
    });
    return response.data;
  }

  // Analytics
  async getJobStats(): Promise<JobStats> {
    const response = await api.get('/jobs/stats');
    return response.data;
  }

  async getConversionAnalytics(): Promise<ConversionAnalytics> {
    const response = await api.get('/jobs/conversion-analytics');
    return response.data;
  }

  // Utility methods
  getJobStatusLabel(status: JobStatus): string {
    const labels: Record<JobStatus, string> = {
      'not_started': 'No iniciado',
      'in_progress': 'En progreso',
      'milestone_review': 'Revisión de hito',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'disputed': 'En disputa'
    };
    return labels[status] || status;
  }

  getJobStatusColor(status: JobStatus): string {
    const colors: Record<JobStatus, string> = {
      'not_started': 'text-gray-600 bg-gray-100',
      'in_progress': 'text-blue-600 bg-blue-100',
      'milestone_review': 'text-warning bg-warning/10',
      'completed': 'text-success bg-success/10',
      'cancelled': 'text-destructive bg-destructive/10',
      'disputed': 'text-orange-600 bg-orange-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  getPaymentStatusLabel(status: PaymentStatus): string {
    const labels: Record<PaymentStatus, string> = {
      'pending': 'Pendiente',
      'paid': 'Pagado',
      'released': 'Liberado',
      'refunded': 'Reembolsado',
      'disputed': 'En disputa'
    };
    return labels[status] || status;
  }

  getPaymentStatusColor(status: PaymentStatus): string {
    const colors: Record<PaymentStatus, string> = {
      'pending': 'text-warning bg-warning/10',
      'paid': 'text-blue-600 bg-blue-100',
      'released': 'text-success bg-success/10',
      'refunded': 'text-destructive bg-destructive/10',
      'disputed': 'text-orange-600 bg-orange-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  formatCurrency(amount: number, currency: string = 'ARS'): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  calculateProgress(milestones: JobMilestone[]): number {
    if (milestones.length === 0) return 0;
    const completedMilestones = milestones.filter(m => m.completed).length;
    return Math.round((completedMilestones / milestones.length) * 100);
  }
}

export const jobsService = new JobsService();