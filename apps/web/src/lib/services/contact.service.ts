import { api } from '../api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  category?: 'general' | 'technical' | 'billing' | 'partnership' | 'feedback';
}

export interface ContactResponse {
  id: string;
  message: string;
  ticketNumber: string;
}

export interface ContactInteraction {
  id: string;
  client_id: string;
  professional_id: string;
  service_id?: string;
  project_id?: string;
  contact_method: 'whatsapp' | 'email' | 'phone' | 'platform';
  message?: string;
  contact_data?: any;
  contacted_at: string;
  converted_to_job: boolean;
  job_id?: string;
  conversion_value?: number;
  client?: { id: string; name: string };
  professional?: { id: string; name: string };
  service?: { id: string; title: string };
  project?: { id: string; title: string };
}

export interface CreateContactInteractionDto {
  professionalId: string;
  serviceId?: string;
  projectId?: string;
  contactMethod: 'whatsapp' | 'email' | 'phone' | 'platform';
  message?: string;
  contactData?: any;
}

export const contactService = {
  async sendContactForm(formData: ContactFormData): Promise<ContactResponse> {
    return api.post<ContactResponse>('/contact', formData);
  },

  async subscribeNewsletter(email: string): Promise<void> {
    return api.post('/contact/newsletter', { email });
  },

  async unsubscribeNewsletter(token: string): Promise<void> {
    return api.post('/contact/unsubscribe', { token });
  },

  /**
   * Create a contact interaction (record that a client contacted a professional about a service)
   */
  async contactProfessional(data: CreateContactInteractionDto): Promise<ContactInteraction> {
    try {
      // api.post already returns the data directly, no need to access .data
      const response = await api.post<ContactInteraction>('/jobs/contacts', data);
      return response;
    } catch (error: any) {
      console.error('Error creating contact interaction:', error);
      throw error;
    }
  },

  /**
   * Get all contact interactions for the current user
   */
  async getMyContacts(): Promise<ContactInteraction[]> {
    try {
      // api.get already returns the data directly, no need to access .data
      const response = await api.get<ContactInteraction[]>('/jobs/contacts/my-contacts');
      return response;
    } catch (error: any) {
      console.error('Error fetching contact interactions:', error);
      throw error;
    }
  },

  /**
   * Mark a contact as converted to a job
   */
  async markContactAsConverted(
    contactId: string,
    jobId: string,
    conversionValue?: number
  ): Promise<ContactInteraction> {
    try {
      // api.put already returns the data directly, no need to access .data
      const response = await api.put<ContactInteraction>(
        `/jobs/contacts/${contactId}/convert`,
        { jobId, conversionValue }
      );
      return response;
    } catch (error: any) {
      console.error('Error marking contact as converted:', error);
      throw error;
    }
  },
};

export default contactService;