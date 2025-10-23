import { apiClient } from '../api';

export interface SubscriptionPlan {
  type: 'basic' | 'premium' | 'enterprise';
  price: number;
  name: string;
  features: string[];
}

export interface PaymentPreference {
  id: string;
  init_point: string;
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
    price: 2999,
    name: 'Plan Basic',
    features: [
      'Cliente + Profesional',
      'Publicar hasta 5 servicios',
      'Responder proyectos ilimitados',
      'Trust Score profesional',
      'Soporte por email',
    ],
  },
  premium: {
    type: 'premium',
    price: 5999,
    name: 'Plan Premium',
    features: [
      'Todo en Basic +',
      'Servicios ilimitados',
      'Badge "Premium" destacado',
      'Prioridad en búsquedas',
      'Estadísticas avanzadas',
      'Soporte prioritario',
    ],
  },
  enterprise: {
    type: 'enterprise',
    price: 12999,
    name: 'Plan Enterprise',
    features: [
      'Todo en Premium +',
      'Equipo de profesionales',
      'API access',
      'Manager dedicado',
      'Personalización avanzada',
      'SLA garantizado',
    ],
  },
};

class SubscriptionService {
  /**
   * Create a MercadoPago payment preference for a subscription plan
   */
  async createPaymentPreference(
    planType: 'basic' | 'premium' | 'enterprise',
  ): Promise<PaymentPreference> {
    const plan = SUBSCRIPTION_PLANS[planType];

    if (!plan) {
      throw new Error('Plan no válido');
    }

    const response = await apiClient.post('/subscription/create-preference', {
      subscriptionType: planType,
      price: plan.price,
    });

    return response.data;
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
    // Use sandbox for testing, production for real payments
    const checkoutUrl = preference.init_point;

    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      throw new Error('URL de pago no disponible');
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
