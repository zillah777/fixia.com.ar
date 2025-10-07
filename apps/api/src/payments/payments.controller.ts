import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, CreatePreferenceDto, WebhookDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create a direct payment
   */
  @Post('create-payment')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`💳 Creating payment for user: ${user.id}`);
    
    try {
      const result = await this.paymentsService.createPayment(createPaymentDto, user.id);
      
      return {
        success: true,
        message: 'Payment created successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('❌ Payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Create a payment preference for Checkout Pro
   */
  @Post('create-preference')
  @UseGuards(JwtAuthGuard)
  async createPreference(
    @Body() createPreferenceDto: CreatePreferenceDto,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`🛒 Creating preference for user: ${user.id}`);
    
    try {
      const result = await this.paymentsService.createPreference(createPreferenceDto, user.id);
      
      return {
        success: true,
        message: 'Payment preference created successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('❌ Preference creation failed:', error);
      throw error;
    }
  }

  /**
   * Handle MercadoPago webhook notifications
   */
  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() webhookData: WebhookDto,
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') requestId?: string,
  ) {
    this.logger.log(`📨 Webhook received - Type: ${webhookData.type}, Action: ${webhookData.action}`);
    
    try {
      // Verify webhook signature in production
      if (process.env.NODE_ENV === 'production') {
        if (!signature) {
          throw new BadRequestException('Missing webhook signature');
        }
        // TODO: Implement signature verification
        // this.verifyWebhookSignature(webhookData, signature);
      }

      await this.paymentsService.handleWebhook(webhookData);
      
      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error('❌ Webhook processing failed:', error);
      // Return success to prevent MercadoPago retries
      return {
        success: true,
        message: 'Webhook received',
      };
    }
  }

  /**
   * Get payment status
   */
  @Get('status/:paymentId')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(
    @Param('paymentId') paymentId: string,
    @CurrentUser() user: any,
  ) {
    this.logger.log(`📊 Getting payment status: ${paymentId} for user: ${user.id}`);
    
    try {
      const result = await this.paymentsService.getPaymentStatus(paymentId);
      
      if (!result) {
        return {
          success: false,
          message: 'Payment not found',
          data: null,
        };
      }
      
      return {
        success: true,
        message: 'Payment status retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get payment status:', error);
      throw error;
    }
  }

  /**
   * Get available payment methods
   */
  @Get('payment-methods')
  @Public()
  async getPaymentMethods() {
    this.logger.log('💳 Getting available payment methods');
    
    // Return common Argentine payment methods
    const paymentMethods = [
      {
        id: 'visa',
        name: 'Visa',
        type: 'credit_card',
        thumbnail: 'https://img.icons8.com/color/48/000000/visa.png',
      },
      {
        id: 'master',
        name: 'Mastercard',
        type: 'credit_card',
        thumbnail: 'https://img.icons8.com/color/48/000000/mastercard.png',
      },
      {
        id: 'amex',
        name: 'American Express',
        type: 'credit_card',
        thumbnail: 'https://img.icons8.com/color/48/000000/amex.png',
      },
      {
        id: 'mercadopago',
        name: 'Mercado Pago',
        type: 'account_money',
        thumbnail: 'https://img.icons8.com/color/48/000000/mercado-pago.png',
      },
      {
        id: 'rapipago',
        name: 'Rapipago',
        type: 'ticket',
        thumbnail: 'https://img.icons8.com/color/48/000000/money-bag.png',
      },
      {
        id: 'pagofacil',
        name: 'Pago Fácil',
        type: 'ticket',
        thumbnail: 'https://img.icons8.com/color/48/000000/money-bag.png',
      },
    ];
    
    return {
      success: true,
      message: 'Payment methods retrieved successfully',
      data: paymentMethods,
    };
  }

  /**
   * Process payment success callback
   */
  @Get('success')
  @Public()
  async paymentSuccess() {
    this.logger.log('✅ Payment success callback received');
    
    return {
      success: true,
      message: 'Payment completed successfully',
      redirectUrl: '/dashboard?payment=success',
    };
  }

  /**
   * Process payment failure callback
   */
  @Get('failure')
  @Public()
  async paymentFailure() {
    this.logger.log('❌ Payment failure callback received');
    
    return {
      success: false,
      message: 'Payment failed',
      redirectUrl: '/dashboard?payment=failure',
    };
  }

  /**
   * Process payment pending callback
   */
  @Get('pending')
  @Public()
  async paymentPending() {
    this.logger.log('⏳ Payment pending callback received');
    
    return {
      success: true,
      message: 'Payment is pending',
      redirectUrl: '/dashboard?payment=pending',
    };
  }

  // TODO: Implement webhook signature verification
  // private verifyWebhookSignature(data: any, signature: string): boolean {
  //   const webhookSecret = this.configService.get<string>('MERCADOPAGO_WEBHOOK_SECRET');
  //   if (!webhookSecret) return true; // Skip verification if secret not configured
  //   
  //   // Implement HMAC signature verification
  //   return true;
  // }
}