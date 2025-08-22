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
};

export default contactService;