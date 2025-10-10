import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Favoritos')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los favoritos del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de favoritos' })
  async getFavorites(@CurrentUser() user: any) {
    return this.favoritesService.getFavorites(user.sub);
  }

  @Get('services')
  @ApiOperation({ summary: 'Obtener servicios favoritos' })
  @ApiResponse({ status: 200, description: 'Lista de servicios favoritos' })
  async getFavoriteServices(@CurrentUser() user: any) {
    return this.favoritesService.getFavoriteServices(user.sub);
  }

  @Get('professionals')
  @ApiOperation({ summary: 'Obtener profesionales favoritos' })
  @ApiResponse({ status: 200, description: 'Lista de profesionales favoritos' })
  async getFavoriteProfessionals(@CurrentUser() user: any) {
    return this.favoritesService.getFavoriteProfessionals(user.sub);
  }

  @Post('services/:serviceId')
  @ApiOperation({ summary: 'Agregar servicio a favoritos' })
  @ApiParam({ name: 'serviceId', description: 'ID del servicio' })
  @ApiResponse({ status: 201, description: 'Servicio agregado a favoritos' })
  @ApiResponse({ status: 400, description: 'El servicio ya está en favoritos' })
  async addServiceToFavorites(
    @CurrentUser() user: any,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ) {
    return this.favoritesService.addServiceToFavorites(user.sub, serviceId);
  }

  @Delete('services/:serviceId')
  @ApiOperation({ summary: 'Eliminar servicio de favoritos' })
  @ApiParam({ name: 'serviceId', description: 'ID del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio eliminado de favoritos' })
  async removeServiceFromFavorites(
    @CurrentUser() user: any,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ) {
    return this.favoritesService.removeServiceFromFavorites(user.sub, serviceId);
  }

  @Post('professionals/:professionalId')
  @ApiOperation({ summary: 'Agregar profesional a favoritos' })
  @ApiParam({ name: 'professionalId', description: 'ID del profesional' })
  @ApiResponse({ status: 201, description: 'Profesional agregado a favoritos' })
  @ApiResponse({ status: 400, description: 'El profesional ya está en favoritos' })
  async addProfessionalToFavorites(
    @CurrentUser() user: any,
    @Param('professionalId', ParseUUIDPipe) professionalId: string,
  ) {
    return this.favoritesService.addProfessionalToFavorites(user.sub, professionalId);
  }

  @Delete('professionals/:professionalId')
  @ApiOperation({ summary: 'Eliminar profesional de favoritos' })
  @ApiParam({ name: 'professionalId', description: 'ID del profesional' })
  @ApiResponse({ status: 200, description: 'Profesional eliminado de favoritos' })
  async removeProfessionalFromFavorites(
    @CurrentUser() user: any,
    @Param('professionalId', ParseUUIDPipe) professionalId: string,
  ) {
    return this.favoritesService.removeProfessionalFromFavorites(user.sub, professionalId);
  }

  @Get('services/:serviceId/check')
  @ApiOperation({ summary: 'Verificar si un servicio está en favoritos' })
  @ApiParam({ name: 'serviceId', description: 'ID del servicio' })
  @ApiResponse({ status: 200, description: 'Estado de favorito' })
  async checkServiceFavorite(
    @CurrentUser() user: any,
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
  ) {
    return this.favoritesService.isServiceFavorite(user.sub, serviceId);
  }
}
