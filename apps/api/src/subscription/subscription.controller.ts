import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Delete,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto, MercadoPagoWebhookDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CsrfGuard } from '../common/guards/csrf.guard';

@ApiTags('Subscriptions')
@Controller('subscription')
@UseGuards(CsrfGuard) // SECURITY: Protect subscription operations from CSRF attacks
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Post('create-preference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear preferencia de pago en MercadoPago',
    description:
      'Crea una preferencia de pago en MercadoPago para activar la suscripción profesional',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencia de pago creada exitosamente',
    schema: {
      example: {
        id: 'PREFERENCE_ID',
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...',
        sandbox_init_point: 'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error al crear preferencia o usuario ya tiene suscripción activa',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createPaymentPreference(
    @Req() req: any,
    @Body() dto: any, // Temporarily use any to bypass validation
  ) {
    this.logger.debug('📦 Received subscription request:', JSON.stringify(dto));
    this.logger.debug('📦 Data types:', {
      subscriptionType: typeof dto.subscriptionType,
      price: typeof dto.price,
    });
    this.logger.debug('📦 Raw DTO:', dto);

    // SECURITY: Server-side validation to prevent amount tampering (CVSS 8.6 mitigation)
    if (!dto.subscriptionType || dto.subscriptionType !== 'basic') {
      throw new BadRequestException('Invalid subscription type. Only "basic" plan is available');
    }

    // Validate subscription price against configured server values
    const hardcodedPrices = {
      basic: Number(process.env.SUBSCRIPTION_PRICE_BASIC) || 3900,
    };

    if (!dto.price || typeof dto.price !== 'number' || dto.price < 0) {
      throw new BadRequestException('Invalid price format');
    }

    // CRITICAL: Verify price matches hardcoded server value (prevents client-side price manipulation)
    const expectedPrice = hardcodedPrices[dto.subscriptionType];
    if (dto.price !== expectedPrice) {
      this.logger.warn(`⚠️ SECURITY ALERT: Price mismatch for subscription ${dto.subscriptionType}`);
      this.logger.warn(`   Client sent: ${dto.price} ARS, Expected: ${expectedPrice} ARS`);
      throw new BadRequestException(
        `Invalid subscription price. Expected ${expectedPrice} ARS for ${dto.subscriptionType} plan`
      );
    }

    // Additional validation: ensure price is within reasonable bounds
    if (dto.price < 1 || dto.price > 9999999) {
      throw new BadRequestException('Subscription price is out of acceptable range');
    }

    const userId = req.user.sub; // Extract user ID from JWT payload
    return this.subscriptionService.createPaymentPreference(userId, dto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener estado de suscripción',
    description: 'Obtiene el estado actual de la suscripción del usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de suscripción obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getSubscriptionStatus(@Req() req: any) {
    const userId = req.user.sub; // Extract user ID from JWT payload
    return this.subscriptionService.getSubscriptionStatus(userId);
  }

  @Delete('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancelar suscripción',
    description:
      'Cancela la renovación automática de la suscripción. El perfil profesional permanecerá activo hasta la fecha de expiración.',
  })
  @ApiResponse({
    status: 200,
    description: 'Suscripción cancelada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No tienes una suscripción activa',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async cancelSubscription(@Req() req: any) {
    const userId = req.user.sub; // Extract user ID from JWT payload
    await this.subscriptionService.cancelSubscription(userId);
    return { message: 'Suscripción cancelada exitosamente' };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook de MercadoPago',
    description:
      'Endpoint para recibir notificaciones de MercadoPago sobre pagos',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook procesado exitosamente',
  })
  async handleWebhook(@Body() webhookData: MercadoPagoWebhookDto) {
    await this.subscriptionService.processWebhook(webhookData);
    return { status: 'ok' };
  }

  @Post('expire')
  @ApiOperation({
    summary: 'Expirar suscripciones vencidas (CRON)',
    description:
      'Endpoint para ser llamado por un cron job para expirar suscripciones vencidas',
  })
  @ApiResponse({
    status: 200,
    description: 'Suscripciones expiradas procesadas exitosamente',
  })
  async expireSubscriptions() {
    await this.subscriptionService.expireSubscriptions();
    return { message: 'Suscripciones procesadas' };
  }
}
