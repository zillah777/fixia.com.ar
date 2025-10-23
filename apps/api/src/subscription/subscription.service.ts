import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateSubscriptionDto } from './dto';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private mercadoPagoClient: MercadoPagoConfig;
  private preferenceClient: Preference;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Initialize MercadoPago SDK
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      this.logger.warn('MercadoPago Access Token not configured. Subscription features will not work.');
    } else {
      this.mercadoPagoClient = new MercadoPagoConfig({
        accessToken,
        options: {
          timeout: 5000,
        },
      });
      this.preferenceClient = new Preference(this.mercadoPagoClient);
    }
  }

  /**
   * Create MercadoPago payment preference for subscription
   */
  async createPaymentPreference(
    userId: string,
    dto: any, // Changed to any temporarily
  ): Promise<any> {
    this.logger.log(`🔍 Checking MercadoPago client: ${!!this.preferenceClient}`);
    this.logger.log(`🔍 MercadoPago Access Token exists: ${!!this.configService.get('MERCADOPAGO_ACCESS_TOKEN')}`);

    if (!this.preferenceClient) {
      this.logger.error('❌ MercadoPago client is not initialized!');
      throw new BadRequestException('MercadoPago not configured');
    }

    // Get user details
    this.logger.log('🔍 UserID received:', userId);
    this.logger.log('🔍 UserID type:', typeof userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Check if user already has active subscription
    if (
      user.is_professional_active &&
      user.subscription_status === 'active' &&
      user.subscription_expires_at &&
      user.subscription_expires_at > new Date()
    ) {
      throw new BadRequestException('Ya tienes una suscripción activa');
    }

    // Get plan details
    const planNames = {
      basic: 'Plan Basic - Fixia',
      premium: 'Plan Premium - Fixia',
    };

    this.logger.log('🚀 About to create MercadoPago preference...');
    this.logger.log('🚀 User email:', user.email);
    this.logger.log('🚀 Plan type:', dto.subscriptionType);
    this.logger.log('🚀 Price:', dto.price);

    try {
      // Create preference
      this.logger.log('🚀 Calling MercadoPago API...');
      const preference = await this.preferenceClient.create({
        body: {
          items: [
            {
              id: dto.subscriptionType,
              title: planNames[dto.subscriptionType] || 'Suscripción Fixia',
              description: `Suscripción mensual ${dto.subscriptionType}`,
              quantity: 1,
              unit_price: dto.price,
              currency_id: 'ARS',
            },
          ],
          payer: {
            name: user.name || 'Usuario',
            email: user.email,
          },
          back_urls: {
            success: `${this.configService.get('FRONTEND_URL')}/subscription/success`,
            failure: `${this.configService.get('FRONTEND_URL')}/subscription/failure`,
            pending: `${this.configService.get('FRONTEND_URL')}/subscription/pending`,
          },
          auto_return: 'approved',
          notification_url: `${this.configService.get('API_URL')}/subscription/webhook`,
          external_reference: JSON.stringify({
            userId,
            subscriptionType: dto.subscriptionType,
            price: dto.price,
          }),
          metadata: {
            user_id: userId,
            subscription_type: dto.subscriptionType,
          },
        },
      });

      this.logger.log(
        `Payment preference created for user ${userId}: ${preference.id}`,
      );

      return {
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error('❌ Error creating MercadoPago preference:', error);
      this.logger.error('❌ Error message:', error.message);
      this.logger.error('❌ Error stack:', error.stack);
      this.logger.error('❌ Full error object:', JSON.stringify(error, null, 2));
      throw new BadRequestException(
        'Error al crear preferencia de pago: ' + error.message,
      );
    }
  }

  /**
   * Activate professional subscription after successful payment
   */
  async activateSubscription(
    userId: string,
    subscriptionType: string,
    price: number,
    mercadoPagoId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription

    // Update user with subscription details
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        is_professional_active: true,
        professional_since: user.professional_since || startDate,
        subscription_type: subscriptionType,
        subscription_status: 'active',
        subscription_started_at: startDate,
        subscription_expires_at: expiryDate,
        subscription_mp_id: mercadoPagoId,
        subscription_price: price,
        auto_renew: true,
      },
    });

    // Create professional profile if it doesn't exist
    const existingProfile = await this.prisma.professionalProfile.findUnique({
      where: { user_id: userId },
    });

    if (!existingProfile) {
      await this.prisma.professionalProfile.create({
        data: {
          user_id: userId,
          level: 'Nuevo',
          availability_status: 'available',
        },
      });
    }

    // Initialize RoleTrustScore for professional role if it doesn't exist
    const existingTrustScore = await this.prisma.roleTrustScore.findUnique({
      where: {
        user_id_role: {
          user_id: userId,
          role: 'professional',
        },
      },
    });

    if (!existingTrustScore) {
      await this.prisma.roleTrustScore.create({
        data: {
          user_id: userId,
          role: 'professional',
          total_likes: 0,
          total_feedback: 0,
          trust_percentage: 0,
          last_calculated_at: new Date(),
        },
      });
    }

    this.logger.log(
      `Professional subscription activated for user ${userId} (${subscriptionType})`,
    );
  }

  /**
   * Cancel subscription (mark for non-renewal)
   */
  async cancelSubscription(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.is_professional_active || user.subscription_status !== 'active') {
      throw new BadRequestException('No tienes una suscripción activa');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscription_status: 'cancelled',
        auto_renew: false,
      },
    });

    this.logger.log(`Subscription cancelled for user ${userId}`);
  }

  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        is_professional_active: true,
        professional_since: true,
        subscription_type: true,
        subscription_status: true,
        subscription_started_at: true,
        subscription_expires_at: true,
        subscription_price: true,
        auto_renew: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Process MercadoPago webhook notification
   */
  async processWebhook(webhookData: any): Promise<void> {
    this.logger.log('Processing MercadoPago webhook:', JSON.stringify(webhookData));

    // MercadoPago sends the payment ID in data.id
    const paymentId = webhookData.data?.id || webhookData.id;

    if (!paymentId) {
      this.logger.warn('Webhook received without payment ID');
      return;
    }

    // Only process payment notifications
    if (webhookData.type !== 'payment') {
      this.logger.log(`Ignoring webhook type: ${webhookData.type}`);
      return;
    }

    try {
      // In production, you would fetch payment details from MercadoPago API
      // For now, we'll use the external_reference from the webhook
      const externalReference = webhookData.data?.external_reference;

      if (!externalReference) {
        this.logger.warn('Webhook received without external reference');
        return;
      }

      let referenceData;
      try {
        referenceData = JSON.parse(externalReference);
      } catch (e) {
        this.logger.error('Invalid external reference format:', externalReference);
        return;
      }

      const { userId, subscriptionType, price } = referenceData;

      if (!userId || !subscriptionType || !price) {
        this.logger.error('Invalid reference data:', referenceData);
        return;
      }

      // Check payment status (in real implementation, fetch from MP API)
      // For now, assume approved if action is payment.updated
      if (webhookData.action === 'payment.updated' || webhookData.action === 'payment.created') {
        await this.activateSubscription(
          userId,
          subscriptionType,
          price,
          paymentId,
        );

        this.logger.log(`Subscription activated via webhook for user ${userId}`);
      }
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      throw error;
    }
  }

  /**
   * Expire subscriptions (to be called by cron job)
   */
  async expireSubscriptions(): Promise<void> {
    const now = new Date();

    const expiredUsers = await this.prisma.user.findMany({
      where: {
        is_professional_active: true,
        subscription_expires_at: {
          lt: now,
        },
        auto_renew: false,
      },
    });

    for (const user of expiredUsers) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          is_professional_active: false,
          subscription_status: 'expired',
        },
      });

      // Hide services but don't delete them
      await this.prisma.service.updateMany({
        where: { professional_id: user.id },
        data: { active: false },
      });

      this.logger.log(`Subscription expired for user ${user.id}`);
    }

    this.logger.log(`Processed ${expiredUsers.length} expired subscriptions`);
  }
}
