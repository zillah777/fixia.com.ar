import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { PrismaService } from '../common/prisma.service';
import { CreatePaymentDto, CreatePreferenceDto, WebhookDto } from './dto/payment.dto';

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

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private mp: MercadoPagoConfig;
  private payment: Payment;
  private preference: Preference;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.initializeMercadoPago();
  }

  private initializeMercadoPago() {
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!accessToken) {
      this.logger.warn('⚠️ MercadoPago not configured - ACCESS_TOKEN missing');
      return;
    }

    try {
      this.mp = new MercadoPagoConfig({
        accessToken,
        options: {
          timeout: 5000,
          idempotencyKey: this.generateIdempotencyKey(),
        }
      });

      this.payment = new Payment(this.mp);
      this.preference = new Preference(this.mp);

      this.logger.log('✅ MercadoPago service initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize MercadoPago:', error);
    }
  }

  /**
   * Create a direct payment
   */
  async createPayment(paymentData: CreatePaymentDto, userId: string): Promise<PaymentResult> {
    if (!this.payment) {
      throw new InternalServerErrorException('MercadoPago service not available');
    }

    try {
      this.logger.log(`💳 Creating payment for amount: ${paymentData.amount}`);

      // Create external reference
      const externalReference = this.generateExternalReference(userId, paymentData.serviceId);

      const paymentRequest = {
        transaction_amount: paymentData.amount,
        description: paymentData.description,
        payment_method_id: paymentData.paymentMethodId,
        external_reference: externalReference,
        payer: {
          email: paymentData.payerEmail,
          first_name: paymentData.payerName?.split(' ')[0],
          last_name: paymentData.payerName?.split(' ').slice(1).join(' '),
          phone: {
            area_code: '11',
            number: paymentData.payerPhone || '1234567890',
          },
        },
        notification_url: `${this.configService.get('API_URL')}/payments/webhook`,
        metadata: {
          user_id: userId,
          service_id: paymentData.serviceId,
          job_id: paymentData.jobId,
          professional_id: paymentData.professionalId,
        },
      };

      const result = await this.payment.create({
        body: paymentRequest,
      });

      this.logger.log(`✅ Payment created successfully: ${result.id}`);

      // Save payment record to database
      await this.savePaymentRecord({
        mpPaymentId: result.id?.toString(),
        amount: paymentData.amount,
        status: result.status,
        statusDetail: result.status_detail,
        paymentMethodId: paymentData.paymentMethodId,
        payerEmail: paymentData.payerEmail,
        payerName: paymentData.payer?.first_name && paymentData.payer?.last_name 
          ? `${paymentData.payer.first_name} ${paymentData.payer.last_name}` 
          : null,
        externalReference,
        userId,
        serviceId: paymentData.serviceId,
        jobId: paymentData.jobId,
        professionalId: paymentData.professionalId,
        description: paymentData.description,
        approvalUrl: result.point_of_interaction?.transaction_data?.ticket_url,
        transactionData: result,
      });

      return {
        id: result.id?.toString() || '',
        status: result.status || 'unknown',
        statusDetail: result.status_detail || '',
        externalReference,
        amount: result.transaction_amount || paymentData.amount,
        currency: result.currency_id || 'ARS',
        paymentMethod: result.payment_method_id || paymentData.paymentMethodId,
        payerEmail: paymentData.payerEmail,
        createdAt: new Date(result.date_created || new Date()),
        approvalUrl: result.point_of_interaction?.transaction_data?.ticket_url,
      };

    } catch (error) {
      this.logger.error('❌ Payment creation failed:', error);
      
      if (error.cause?.length > 0) {
        const cause = error.cause[0];
        throw new BadRequestException(`Payment failed: ${cause.description}`);
      }
      
      throw new InternalServerErrorException('Payment processing failed');
    }
  }

  /**
   * Create a payment preference for Checkout Pro
   */
  async createPreference(preferenceData: CreatePreferenceDto, userId: string): Promise<PreferenceResult> {
    if (!this.preference) {
      throw new InternalServerErrorException('MercadoPago service not available');
    }

    try {
      this.logger.log(`🛒 Creating preference for amount: ${preferenceData.amount}`);

      const externalReference = this.generateExternalReference(userId, preferenceData.serviceId);
      const baseUrl = this.configService.get('APP_URL', 'https://fixia.com.ar');

      const preferenceRequest = {
        items: [
          {
            id: preferenceData.serviceId || 'service',
            title: preferenceData.title,
            description: preferenceData.description,
            quantity: 1,
            unit_price: preferenceData.amount,
            currency_id: 'ARS',
          },
        ],
        payer: {
          email: preferenceData.payerEmail,
        },
        external_reference: externalReference,
        back_urls: {
          success: preferenceData.successUrl || `${baseUrl}/payments/success`,
          failure: preferenceData.failureUrl || `${baseUrl}/payments/failure`,
          pending: preferenceData.pendingUrl || `${baseUrl}/payments/pending`,
        },
        auto_return: 'approved',
        notification_url: `${this.configService.get('API_URL')}/payments/webhook`,
        metadata: {
          user_id: userId,
          service_id: preferenceData.serviceId,
          job_id: preferenceData.jobId,
          professional_id: preferenceData.professionalId,
        },
        payment_methods: {
          excluded_payment_types: [],
          excluded_payment_methods: [],
          installments: 12,
        },
      };

      const result = await this.preference.create({
        body: preferenceRequest,
      });

      this.logger.log(`✅ Preference created successfully: ${result.id}`);

      // Save preference record to database
      await this.savePreferenceRecord({
        mpPreferenceId: result.id,
        amount: preferenceData.amount,
        title: preferenceData.title,
        description: preferenceData.description,
        payerEmail: preferenceData.payerEmail,
        externalReference,
        userId,
        serviceId: preferenceData.serviceId,
        jobId: preferenceData.jobId,
        professionalId: preferenceData.professionalId,
        successUrl: preferenceData.successUrl,
        failureUrl: preferenceData.failureUrl,
        pendingUrl: preferenceData.pendingUrl,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point,
        clientId: result.client_id,
        collectorId: result.collector_id,
      });

      return {
        id: result.id || '',
        sandboxInitPoint: result.sandbox_init_point,
        initPoint: result.init_point,
        clientId: result.client_id || '',
        collectorId: result.collector_id || 0,
      };

    } catch (error) {
      this.logger.error('❌ Preference creation failed:', error);
      throw new InternalServerErrorException('Preference creation failed');
    }
  }

  /**
   * Handle MercadoPago webhook notifications
   */
  async handleWebhook(webhookData: WebhookDto): Promise<void> {
    this.logger.log(`📨 Webhook received: ${webhookData.type} - ${webhookData.action}`);

    try {
      if (webhookData.type === 'payment') {
        const paymentId = webhookData.data?.id;
        
        if (paymentId) {
          await this.processPaymentNotification(paymentId);
        }
      }
    } catch (error) {
      this.logger.error('❌ Webhook processing failed:', error);
      // Don't throw error to avoid retries from MercadoPago
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResult | null> {
    if (!this.payment) {
      throw new InternalServerErrorException('MercadoPago service not available');
    }

    try {
      const result = await this.payment.get({ id: paymentId });

      return {
        id: result.id?.toString() || '',
        status: result.status || 'unknown',
        statusDetail: result.status_detail || '',
        externalReference: result.external_reference,
        amount: result.transaction_amount || 0,
        currency: result.currency_id || 'ARS',
        paymentMethod: result.payment_method_id || '',
        payerEmail: result.payer?.email || '',
        createdAt: new Date(result.date_created || new Date()),
      };

    } catch (error) {
      this.logger.error(`❌ Failed to get payment status for ${paymentId}:`, error);
      return null;
    }
  }

  private async processPaymentNotification(paymentId: string): Promise<void> {
    const paymentStatus = await this.getPaymentStatus(paymentId);
    
    if (!paymentStatus) {
      this.logger.error(`❌ Could not fetch payment status for: ${paymentId}`);
      return;
    }

    // Update payment record in database
    await this.updatePaymentRecord(paymentId, {
      status: paymentStatus.status,
      statusDetail: paymentStatus.statusDetail,
    });

    // Process business logic based on payment status
    if (paymentStatus.status === 'approved') {
      await this.handleApprovedPayment(paymentStatus);
    } else if (paymentStatus.status === 'rejected') {
      await this.handleRejectedPayment(paymentStatus);
    }
  }

  private async handleApprovedPayment(payment: PaymentResult): Promise<void> {
    this.logger.log(`✅ Payment approved: ${payment.id}`);
    
    // Business logic for approved payments
    // - Update job status
    // - Send notifications
    // - Release funds to professional
    // etc.
  }

  private async handleRejectedPayment(payment: PaymentResult): Promise<void> {
    this.logger.log(`❌ Payment rejected: ${payment.id}`);
    
    // Business logic for rejected payments
    // - Notify user
    // - Update job status
    // etc.
  }

  private generateExternalReference(userId: string, serviceId?: string): string {
    const timestamp = Date.now();
    const prefix = serviceId ? `SRV_${serviceId}` : 'PAY';
    return `${prefix}_${userId}_${timestamp}`;
  }

  private generateIdempotencyKey(): string {
    return `fixia_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private mapMPStatusToPaymentStatus(mpStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'approved': 'approved',
      'authorized': 'authorized',
      'in_process': 'in_process',
      'in_mediation': 'in_mediation',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'charged_back': 'charged_back'
    };
    
    return statusMap[mpStatus] || 'pending';
  }

  private async savePaymentRecord(data: any): Promise<void> {
    try {
      this.logger.log(`💾 Saving payment record: ${data.mpPaymentId}`);
      
      // Map data to current Payment schema structure
      const paymentData = {
        job_id: data.jobId || null,
        service_id: data.serviceId || null, 
        amount: data.amount,
        currency: 'ARS',
        status: this.mapMPStatusToPaymentStatus(data.status),
        payment_method: data.paymentMethodId,
        transaction_id: data.mpPaymentId,
        mp_payment_id: data.mpPaymentId,
        mp_preference_id: data.mpPreferenceId,
        external_reference: data.externalReference,
        status_detail: data.statusDetail,
        user_id: data.userId,
        professional_id: data.professionalId,
        payer_email: data.payerEmail,
        payer_name: data.payerName,
        description: data.description,
        approval_url: data.approvalUrl,
        transaction_data: data.transactionData ? JSON.stringify(data.transactionData) : null,
        platform_fee: data.platformFee,
        professional_amount: data.professionalAmount,
      };

      await this.prisma.payment.create({ data: paymentData });
      this.logger.log(`✅ Payment record saved successfully`);
      
    } catch (error) {
      this.logger.error('❌ Failed to save payment record:', error);
    }
  }

  private async savePreferenceRecord(data: any): Promise<void> {
    try {
      this.logger.log(`💾 Saving preference record: ${data.mpPreferenceId}`);
      
      const preferenceData = {
        mp_preference_id: data.mpPreferenceId,
        external_reference: data.externalReference,
        amount: data.amount,
        currency: 'ARS',
        title: data.title,
        description: data.description,
        payer_email: data.payerEmail,
        user_id: data.userId,
        service_id: data.serviceId || null,
        job_id: data.jobId || null,
        professional_id: data.professionalId || null,
        success_url: data.successUrl,
        failure_url: data.failureUrl,
        pending_url: data.pendingUrl,
        init_point: data.initPoint,
        sandbox_init_point: data.sandboxInitPoint,
        client_id: data.clientId,
        collector_id: data.collectorId
      };

      await this.prisma.paymentPreference.create({ data: preferenceData });
      this.logger.log(`✅ Preference record saved successfully`);
      
    } catch (error) {
      this.logger.error('❌ Failed to save preference record:', error);
    }
  }

  private async updatePaymentRecord(paymentId: string, updates: any): Promise<void> {
    try {
      this.logger.log(`🔄 Updating payment record: ${paymentId}`);
      
      const updateData = {
        status: this.mapMPStatusToPaymentStatus(updates.status),
        status_detail: updates.statusDetail,
        paid_at: updates.status === 'approved' ? new Date() : undefined,
        transaction_data: updates.transactionData ? JSON.stringify(updates.transactionData) : undefined,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      await this.prisma.payment.update({
        where: { mp_payment_id: paymentId },
        data: updateData,
      });
      
      this.logger.log(`✅ Payment record updated successfully`);
      
    } catch (error) {
      this.logger.error('❌ Failed to update payment record:', error);
    }
  }

  async testConfiguration(): Promise<any> {
    this.logger.log('🧪 Testing MercadoPago configuration...');
    
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    const publicKey = this.configService.get<string>('MERCADOPAGO_PUBLIC_KEY');
    const webhookSecret = this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET');
    
    const result = {
      hasAccessToken: !!accessToken,
      hasPublicKey: !!publicKey,
      hasWebhookSecret: !!webhookSecret,
      accessTokenPrefix: accessToken ? accessToken.substring(0, 15) + '...' : null,
      publicKeyPrefix: publicKey ? publicKey.substring(0, 15) + '...' : null,
      mercadoPagoInitialized: !!this.mp,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    
    this.logger.log('🔍 Configuration test results:', result);
    
    return result;
  }

  async createTestPreference(testData: any): Promise<PreferenceResult> {
    this.logger.log('🧪 Creating test preference with MercadoPago...');
    
    if (!this.preference) {
      throw new InternalServerErrorException('MercadoPago not initialized');
    }

    const externalReference = this.generateExternalReference('test-user', testData.serviceId);
    
    const preferenceBody = {
      items: [
        {
          id: testData.serviceId || 'test-service',
          title: testData.title,
          description: testData.description,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: testData.amount,
        },
      ],
      payer: {
        email: testData.payerEmail,
      },
      back_urls: {
        success: testData.successUrl,
        failure: testData.failureUrl,
        pending: testData.pendingUrl,
      },
      auto_return: 'approved',
      external_reference: externalReference,
      notification_url: `${process.env.APP_URL || 'https://api.fixia.app'}/payments/webhook`,
      expires: false,
      // Test environment settings
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1,
      },
    };

    try {
      this.logger.log('📝 Preference request body:', JSON.stringify(preferenceBody, null, 2));
      
      const preference = await this.preference.create({ body: preferenceBody });
      
      this.logger.log('✅ Preference created successfully:', preference.id);
      
      const result: PreferenceResult = {
        id: preference.id!,
        sandboxInitPoint: preference.sandbox_init_point || undefined,
        initPoint: preference.init_point || undefined,
        clientId: preference.client_id || '',
        collectorId: preference.collector_id || 0,
      };

      // Save preference record for tracking
      await this.savePreferenceRecord({
        mpPreferenceId: preference.id!,
        externalReference,
        amount: testData.amount,
        title: testData.title,
        description: testData.description,
        payerEmail: testData.payerEmail,
        userId: 'test-user',
        serviceId: testData.serviceId,
        successUrl: testData.successUrl,
        failureUrl: testData.failureUrl,
        pendingUrl: testData.pendingUrl,
        initPoint: result.initPoint,
        sandboxInitPoint: result.sandboxInitPoint,
        clientId: result.clientId,
        collectorId: result.collectorId,
      });

      return result;
      
    } catch (error) {
      this.logger.error('❌ MercadoPago preference creation failed:', error);
      
      if (error.cause) {
        this.logger.error('📋 Error details:', JSON.stringify(error.cause, null, 2));
      }
      
      throw new InternalServerErrorException(
        `Failed to create payment preference: ${error.message}`
      );
    }
  }

  async handleSimulatedWebhook(webhookData: any): Promise<any> {
    this.logger.log('🧪 Processing simulated webhook...');
    this.logger.log(`📨 Webhook Type: ${webhookData.type}, Action: ${webhookData.action}`);
    
    if (webhookData.type === 'payment' && webhookData.action === 'payment.updated') {
      const paymentId = webhookData.data?.id;
      
      if (paymentId) {
        this.logger.log(`🔍 Processing payment update for: ${paymentId}`);
        
        // Simulate payment status check (normally would call MercadoPago API)
        const simulatedPaymentStatus = {
          id: paymentId,
          status: 'approved',
          statusDetail: 'approved_test',
          amount: 1000,
          currency: 'ARS',
          paymentMethod: 'visa',
          payerEmail: 'test@fixia.app',
          externalReference: 'SRV_test-service-123_test-user_1728422127369',
          createdAt: new Date(),
        };
        
        this.logger.log('✅ Simulated payment approved:', simulatedPaymentStatus);
        
        // Trigger business logic for approved payment
        await this.handleApprovedPayment(simulatedPaymentStatus);
        
        return {
          processed: true,
          paymentStatus: simulatedPaymentStatus,
          message: 'Simulated webhook processed successfully'
        };
      }
    }
    
    return {
      processed: false,
      message: 'Webhook simulation completed but no action taken'
    };
  }
}