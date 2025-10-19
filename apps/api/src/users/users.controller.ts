import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Usuario')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
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

  @Get('users/:userId')
  @Public()
  @ApiOperation({ summary: 'Obtener perfil público de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario', type: 'string' })
  @ApiResponse({ status: 200, description: 'Perfil público del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getPublicProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.usersService.getPublicProfile(userId);
  }

  @Delete('user/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar cuenta de usuario (soft delete)' })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada exitosamente' })
  async deleteAccount(@CurrentUser() user: any) {
    return this.usersService.deleteUser(user.sub, user.sub);
  }
}