import { api } from '../api';

export interface CreatePaymentDto {
  amount: number;
  description: string;
  paymentMethodId: string;
  payerEmail: string;
  payerName?: string;
  payerPhone?: string;
  serviceId?: string;
  jobId?: string;
  professionalId?: string;
}

export interface CreatePreferenceDto {
  amount: number;
  title: string;
  description: string;
  payerEmail: string;
  serviceId?: string;
  jobId?: string;
  professionalId?: string;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  statusDetail: string;
  externalReference?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  payerEmail: string;
  createdAt: Date;
  approvalUrl?: string;
}

export interface PreferenceResult {
  id: string;
  sandboxInitPoint?: string;
  initPoint?: string;
  clientId: string;
  collectorId: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'ticket' | 'account_money';
  thumbnail: string;
}

class PaymentsService {
  /**
   * Create a direct payment
   * Note: api.post already unwraps the TransformInterceptor response format
   * Backend returns { success, message, data } and api.post extracts 'data'
   */
  async createPayment(paymentData: CreatePaymentDto): Promise<PaymentResult> {
    // api.post returns response.data.data (already unwrapped)
    return api.post<PaymentResult>('/payments/create-payment', paymentData);
  }

  /**
   * Create a payment preference for Checkout Pro
   */
  async createPreference(preferenceData: CreatePreferenceDto): Promise<PreferenceResult> {
    // api.post returns response.data.data (already unwrapped)
    return api.post<PreferenceResult>('/payments/create-preference', preferenceData);
  }

  /**
   * Get payment status by ID
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResult | null> {
    try {
      // api.get returns response.data.data (already unwrapped)
      return api.get<PaymentResult>(`/payments/status/${paymentId}`);
    } catch (error) {
      console.error('Error getting payment status:', error);
      return null;
    }
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    // api.get returns response.data.data (already unwrapped)
    return api.get<PaymentMethod[]>('/payments/payment-methods');
  }

  // Helper methods for frontend integration
  redirectToCheckout(preferenceId: string, sandbox: boolean = false): void {
    const baseUrl = sandbox 
      ? 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect'
      : 'https://mercadopago.com.ar/checkout/v1/redirect';
    
    const checkoutUrl = `${baseUrl}?pref_id=${preferenceId}`;
    window.location.href = checkoutUrl;
  }

  openCheckoutModal(preferenceId: string, sandbox: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      // This requires MercadoPago SDK to be loaded in the frontend
      if (typeof window !== 'undefined' && (window as any).MercadoPago) {
        const mp = new (window as any).MercadoPago(
          process.env.VITE_MERCADOPAGO_PUBLIC_KEY,
          {
            locale: 'es-AR'
          }
        );

        mp.checkout({
          preference: {
            id: preferenceId
          },
          autoOpen: true,
        }).then(resolve).catch(reject);
      } else {
        reject(new Error('MercadoPago SDK not loaded'));
      }
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  }

  getStatusMessage(status: string, statusDetail?: string): string {
    const statusMessages: Record<string, string> = {
      'pending': 'Pago pendiente',
      'approved': 'Pago aprobado',
      'authorized': 'Pago autorizado',
      'in_process': 'Procesando pago',
      'in_mediation': 'En mediación',
      'rejected': 'Pago rechazado',
      'cancelled': 'Pago cancelado',
      'refunded': 'Pago reembolsado',
      'charged_back': 'Contracargo',
    };

    const detailMessages: Record<string, string> = {
      'pending_contingency': 'Pendiente por contingencia',
      'pending_review_manual': 'Pendiente de revisión manual',
      'cc_rejected_insufficient_amount': 'Fondos insuficientes',
      'cc_rejected_bad_filled_card_number': 'Número de tarjeta incorrecto',
      'cc_rejected_bad_filled_date': 'Fecha de vencimiento incorrecta',
      'cc_rejected_bad_filled_security_code': 'Código de seguridad incorrecto',
      'cc_rejected_bad_filled_other': 'Error en los datos de la tarjeta',
    };

    if (statusDetail && detailMessages[statusDetail]) {
      return detailMessages[statusDetail];
    }

    return statusMessages[status] || 'Estado desconocido';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'pending': 'text-warning bg-warning/10',
      'approved': 'text-success bg-success/10',
      'authorized': 'text-blue-600 bg-blue-100',
      'in_process': 'text-blue-600 bg-blue-100',
      'in_mediation': 'text-orange-600 bg-orange-100',
      'rejected': 'text-destructive bg-destructive/10',
      'cancelled': 'text-gray-600 bg-gray-100',
      'refunded': 'text-purple-600 bg-purple-100',
      'charged_back': 'text-destructive bg-destructive/10',
    };

    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  calculateInstallments(amount: number, rate: number = 0): Array<{installments: number, amount: number, totalAmount: number}> {
    const installmentOptions = [1, 3, 6, 9, 12];
    
    return installmentOptions.map(installments => {
      const totalAmount = amount * (1 + (rate * (installments - 1) / 100));
      const installmentAmount = totalAmount / installments;
      
      return {
        installments,
        amount: Math.round(installmentAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
      };
    });
  }

  // Validation helpers
  validatePaymentData(data: CreatePaymentDto): string[] {
    const errors: string[] = [];

    if (data.amount <= 0) {
      errors.push('El monto debe ser mayor a cero');
    }

    if (!data.description?.trim()) {
      errors.push('La descripción es requerida');
    }

    if (!data.paymentMethodId?.trim()) {
      errors.push('El método de pago es requerido');
    }

    if (!data.payerEmail?.trim()) {
      errors.push('El email del pagador es requerido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.payerEmail && !emailRegex.test(data.payerEmail)) {
      errors.push('El email del pagador no es válido');
    }

    return errors;
  }

  validatePreferenceData(data: CreatePreferenceDto): string[] {
    const errors: string[] = [];

    if (data.amount <= 0) {
      errors.push('El monto debe ser mayor a cero');
    }

    if (!data.title?.trim()) {
      errors.push('El título es requerido');
    }

    if (!data.description?.trim()) {
      errors.push('La descripción es requerida');
    }

    if (!data.payerEmail?.trim()) {
      errors.push('El email del pagador es requerido');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.payerEmail && !emailRegex.test(data.payerEmail)) {
      errors.push('El email del pagador no es válido');
    }

    return errors;
  }
}

export const paymentsService = new PaymentsService();