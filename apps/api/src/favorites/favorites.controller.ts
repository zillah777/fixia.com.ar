import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user favorites (services and professionals)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Favorites retrieved successfully',
  })
  async getAllFavorites(@CurrentUser() user: any) {
    try {
      return await this.favoritesService.getAllFavorites(user.sub);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve favorites',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('services')
  @ApiOperation({ summary: 'Get favorite services' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Favorite services retrieved successfully',
  })
  async getFavoriteServices(@CurrentUser() user: any) {
    try {
      return await this.favoritesService.getFavoriteServices(user.sub);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve favorite services',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('professionals')
  @ApiOperation({ summary: 'Get favorite professionals' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Favorite professionals retrieved successfully',
  })
  async getFavoriteProfessionals(@CurrentUser() user: any) {
    try {
      return await this.favoritesService.getFavoriteProfessionals(user.sub);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve favorite professionals',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('services/:serviceId')
  @ApiOperation({ summary: 'Add service to favorites' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service added to favorites',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Service already in favorites',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  async addServiceToFavorites(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    try {
      return await this.favoritesService.addServiceToFavorites(
        user.sub,
        serviceId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to add service to favorites',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('services/:serviceId')
  @ApiOperation({ summary: 'Remove service from favorites' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service removed from favorites',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Favorite not found',
  })
  async removeServiceFromFavorites(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    try {
      return await this.favoritesService.removeServiceFromFavorites(
        user.sub,
        serviceId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to remove service from favorites',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('professionals/:professionalId')
  @ApiOperation({ summary: 'Add professional to favorites' })
  @ApiParam({ name: 'professionalId', description: 'Professional ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Professional added to favorites',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Professional already in favorites',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Professional not found',
  })
  async addProfessionalToFavorites(
    @CurrentUser() user: any,
    @Param('professionalId') professionalId: string,
  ) {
    try {
      return await this.favoritesService.addProfessionalToFavorites(
        user.sub,
        professionalId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to add professional to favorites',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('professionals/:professionalId')
  @ApiOperation({ summary: 'Remove professional from favorites' })
  @ApiParam({ name: 'professionalId', description: 'Professional ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Professional removed from favorites',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Favorite not found',
  })
  async removeProfessionalFromFavorites(
    @CurrentUser() user: any,
    @Param('professionalId') professionalId: string,
  ) {
    try {
      return await this.favoritesService.removeProfessionalFromFavorites(
        user.sub,
        professionalId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to remove professional from favorites',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('services/:serviceId/check')
  @ApiOperation({ summary: 'Check if service is in favorites' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check result returned',
  })
  async isServiceFavorite(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    try {
      return await this.favoritesService.isServiceFavorite(user.sub, serviceId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to check favorite status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('professionals/:professionalId/check')
  @ApiOperation({ summary: 'Check if professional is in favorites' })
  @ApiParam({ name: 'professionalId', description: 'Professional ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check result returned',
  })
  async isProfessionalFavorite(
    @CurrentUser() user: any,
    @Param('professionalId') professionalId: string,
  ) {
    try {
      return await this.favoritesService.isProfessionalFavorite(user.sub, professionalId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to check favorite status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
