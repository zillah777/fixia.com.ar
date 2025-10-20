import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackResponseDto, TrustScoreDto } from './dto/feedback-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({
    summary: 'Dar feedback a otro usuario',
    description:
      'Permite a cualquier usuario dar feedback (comentario + like) a otro usuario. El like incrementa el Trust Score.',
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback creado exitosamente',
    type: FeedbackResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No puedes dar feedback a ti mismo',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario destinatario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya has dado feedback para este trabajo y usuario',
  })
  async giveFeedback(
    @Body() dto: CreateFeedbackDto,
    @CurrentUser() user: any,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.giveFeedback(user.sub, dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar feedback propio',
    description: 'Permite editar el comentario o el like de un feedback que diste.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del feedback a actualizar',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback actualizado exitosamente',
    type: FeedbackResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Solo puedes editar tu propio feedback',
  })
  @ApiResponse({ status: 404, description: 'Feedback no encontrado' })
  async updateFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeedbackDto,
    @CurrentUser() user: any,
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.updateFeedback(id, user.sub, dto);
  }

  @Get('received')
  @ApiOperation({
    summary: 'Ver feedback recibido',
    description: 'Obtiene todo el feedback que has recibido de otros usuarios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de feedback recibido',
    type: [FeedbackResponseDto],
  })
  async getMyFeedbackReceived(
    @CurrentUser() user: any,
  ): Promise<FeedbackResponseDto[]> {
    return this.feedbackService.getFeedbackReceived(user.sub);
  }

  @Get('received/:userId')
  @ApiOperation({
    summary: 'Ver feedback recibido por un usuario específico',
    description:
      'Obtiene todo el feedback que un usuario específico ha recibido (público).',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de feedback recibido por el usuario',
    type: [FeedbackResponseDto],
  })
  async getFeedbackReceivedByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<FeedbackResponseDto[]> {
    return this.feedbackService.getFeedbackReceived(userId);
  }

  @Get('given')
  @ApiOperation({
    summary: 'Ver feedback dado',
    description: 'Obtiene todo el feedback que has dado a otros usuarios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de feedback dado',
    type: [FeedbackResponseDto],
  })
  async getMyFeedbackGiven(
    @CurrentUser() user: any,
  ): Promise<FeedbackResponseDto[]> {
    return this.feedbackService.getFeedbackGiven(user.sub);
  }

  @Get('job/:jobId')
  @ApiOperation({
    summary: 'Ver feedback de un trabajo',
    description:
      'Obtiene todo el feedback relacionado a un trabajo específico (solo para participantes del trabajo).',
  })
  @ApiParam({
    name: 'jobId',
    description: 'ID del trabajo',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de feedback del trabajo',
    type: [FeedbackResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Solo puedes ver feedback de trabajos en los que participaste',
  })
  @ApiResponse({ status: 404, description: 'Trabajo no encontrado' })
  async getFeedbackForJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: any,
  ): Promise<FeedbackResponseDto[]> {
    return this.feedbackService.getFeedbackForJob(jobId, user.sub);
  }

  @Get('trust-score/:userId')
  @ApiOperation({
    summary: 'Calcular Trust Score de un usuario (todos los roles)',
    description:
      'Calcula el Trust Score basado en likes recibidos (público para cualquier usuario).',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Trust Score del usuario',
    type: TrustScoreDto,
  })
  async getTrustScore(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<TrustScoreDto> {
    return this.feedbackService.calculateTrustScore(userId);
  }

  @Get('trust-score/:userId/:role')
  @ApiOperation({
    summary: 'Calcular Trust Score por rol específico (NEW: Dual Roles)',
    description:
      'Calcula el Trust Score de un usuario en un rol específico: "client" o "professional".',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    type: 'string',
  })
  @ApiParam({
    name: 'role',
    description: 'Rol del usuario',
    enum: ['client', 'professional'],
  })
  @ApiResponse({
    status: 200,
    description: 'Trust Score del usuario en ese rol',
    type: TrustScoreDto,
  })
  async getRoleTrustScore(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('role') role: 'client' | 'professional',
  ): Promise<TrustScoreDto> {
    return this.feedbackService.calculateRoleTrustScore(userId, role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar feedback propio',
    description: 'Elimina un feedback que diste.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del feedback a eliminar',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Feedback eliminado exitosamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo puedes eliminar tu propio feedback',
  })
  @ApiResponse({ status: 404, description: 'Feedback no encontrado' })
  async deleteFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.feedbackService.deleteFeedback(id, user.sub);
  }
}
