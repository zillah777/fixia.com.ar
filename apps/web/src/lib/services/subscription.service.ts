import { apiClient } from '../api';

export interface SubscriptionPlan {
  type: 'basic';
  price: number;
  name: string;
  features: string[];
}

export interface PaymentPreference {
  id: string;
  initPoint?: string;
  init_point?: string;
  sandboxInitPoint?: string;
  sandbox_init_point?: string;
}

export interface SubscriptionStatus {
  is_professional_active: boolean;
  professional_since: string | null;
  subscription_type: string | null;
  subscription_status: string | null;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  subscription_price: number | null;
  auto_renew: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    type: 'basic',
    price: 3900,
    name: 'Plan Profesional',
    features: [
      'Cliente + Profesional',
      'Publicar hasta 5 servicios',
      'Responder proyectos ilimitados',
      'Trust Score profesional',
      'Soporte por email',
    ],
  },
};

class SubscriptionService {
  /**
   * Create a MercadoPago payment preference for a subscription plan
   */
  async createPaymentPreference(
    planType: 'basic',
  ): Promise<PaymentPreference> {
    const plan = SUBSCRIPTION_PLANS[planType];

    if (!plan) {
      throw new Error('Plan no válido');
    }

    const response = await apiClient.post('/subscription/create-preference', {
      subscriptionType: planType,
      price: plan.price,
    });

    // Backend wraps response in {success: true, data: {...}}
    // Extract the actual preference data from response.data.data
    const preferenceData = response.data.data || response.data;

    console.log('✅ Preference data extracted:', preferenceData);

    return preferenceData;
  }

  /**
   * Get current subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await apiClient.get('/subscription/status');
    return response.data;
  }

  /**
   * Cancel subscription (prevent auto-renewal)
   */
  async cancelSubscription(): Promise<void> {
    await apiClient.delete('/subscription/cancel');
  }

  /**
   * Redirect user to MercadoPago checkout
   */
  redirectToCheckout(preference: PaymentPreference): void {
    // Try both camelCase and snake_case versions (backend may return either)
    const checkoutUrl = preference.initPoint || preference.init_point;

    if (checkoutUrl) {
      console.log('🔗 Redirecting to checkout:', checkoutUrl.substring(0, 80) + '...');
      window.location.href = checkoutUrl;
    } else {
      console.error('❌ Payment preference missing URL:', preference);
      throw new Error('URL de pago no disponible. Por favor intenta de nuevo.');
    }
  }

  /**
   * Get plan details by type
   */
  getPlanDetails(planType: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS[planType] || null;
  }

  /**
   * Get all available plans
   */
  getAllPlans(): SubscriptionPlan[] {
    return Object.values(SUBSCRIPTION_PLANS);
  }
}

export const subscriptionService = new SubscriptionService();
