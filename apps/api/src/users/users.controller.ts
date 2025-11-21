import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserStatsService } from './user-stats.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpgradeToProfessionalDto } from './dto/upgrade-to-professional.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Usuario')
@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userStatsService: UserStatsService,
  ) { }

  @Get('user/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getUserProfile(user.sub);
  }

  @Put('user/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 403, description: 'No autorizado para actualizar este perfil' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // Explicit authorization check - ensure user can only update their own profile
    if (!user.sub) {
      throw new BadRequestException('User ID missing from authentication token');
    }

    return this.usersService.updateProfile(user.sub, updateProfileDto);
  }

  @Get('user/dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard del usuario' })
  @ApiResponse({ status: 200, description: 'Datos del dashboard' })
  async getDashboard(@CurrentUser() user: any) {
    return this.usersService.getDashboard(user.sub);
  }

  @Get('professionals/top-rated')
  @Public()
  @ApiOperation({ summary: 'Obtener profesionales mejor calificados' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de profesionales a retornar (default: 6)' })
  @ApiResponse({ status: 200, description: 'Lista de profesionales mejor calificados' })
  async getTopRatedProfessionals(
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ) {
    return this.usersService.getTopRatedProfessionals(limit);
  }

  @Get('stats/public')
  @Public()
  @ApiOperation({ summary: 'Obtener estadísticas públicas de la plataforma' })
  @ApiResponse({ status: 200, description: 'Estadísticas públicas' })
  async getPublicStats() {
    return this.usersService.getPublicStats();
  }

  @Get('users/:userId')
  @Public()
  @ApiOperation({ summary: 'Obtener perfil público de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario', type: 'string' })
  @ApiResponse({ status: 200, description: 'Perfil público del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getPublicProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.usersService.getPublicProfile(userId);
  }

  @Get('users/:userId/stats')
  @Public()
  @ApiOperation({ summary: 'Obtener estadísticas calculadas de un profesional' })
  @ApiParam({ name: 'userId', description: 'ID del usuario', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del profesional',
    schema: {
      example: {
        completionRate: 98,
        onTimeDelivery: 95,
        repeatClients: 75,
        avgProjectValue: 1250,
        completedProjects: 156,
        totalProjects: 159,
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getUserStats(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userStatsService.calculateProfessionalStats(userId);
  }

  @Delete('user/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar cuenta de usuario (soft delete)' })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada exitosamente' })
  async deleteAccount(@CurrentUser() user: any) {
    return this.usersService.deleteUser(user.sub, user.sub);
  }

  @Post('users/upgrade-to-professional')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar cuenta de cliente a profesional DUAL',
    description: 'Permite a un cliente convertirse en profesional manteniendo sus datos de cliente. Crea una cuenta DUAL que puede actuar como cliente y profesional.'
  })
  @ApiResponse({ status: 200, description: 'Cuenta actualizada exitosamente a profesional DUAL' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o campos requeridos faltantes' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene una cuenta profesional' })
  async upgradeToProfessional(
    @CurrentUser() user: any,
    @Body() upgradeDto: UpgradeToProfessionalDto,
  ) {
    return this.usersService.upgradeToProfessional(user.sub, upgradeDto);
  }
}