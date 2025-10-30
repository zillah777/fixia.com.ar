import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Oportunidades')
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get('categories-stats')
  @Public()
  @ApiOperation({
    summary: 'Obtener estadísticas de categorías con anuncios activos',
    description: 'Retorna categorías con cantidad de anuncios/oportunidades activas. Público para mostrar en ticker LED.'
  })
  @ApiResponse({ status: 200, description: 'Estadísticas de categorías con anuncios activos' })
  getCategoriesStats() {
    return this.opportunitiesService.getCategoriesWithActiveAnnouncements();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('professional')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar oportunidades para profesionales',
    description: 'Obtiene proyectos abiertos ordenados por relevancia según el perfil del profesional'
  })
  @ApiResponse({ status: 200, description: 'Lista de oportunidades con score de compatibilidad' })
  @ApiResponse({ status: 403, description: 'Solo profesionales pueden ver oportunidades' })
  getOpportunities(@CurrentUser() user: any): Promise<any> {
    return this.opportunitiesService.getOpportunities(user.sub);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('professional')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas de oportunidades del profesional' })
  @ApiResponse({ status: 200, description: 'Estadísticas de oportunidades y propuestas' })
  @ApiResponse({ status: 403, description: 'Solo profesionales pueden ver estadísticas' })
  getStats(@CurrentUser() user: any) {
    return this.opportunitiesService.getOpportunityStats(user.sub);
  }

  @Post(':opportunityId/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('professional')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aplicar a una oportunidad' })
  @ApiParam({ name: 'opportunityId', description: 'ID de la oportunidad', type: 'string' })
  @ApiResponse({ status: 201, description: 'Propuesta enviada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o ya aplicó a esta oportunidad' })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  async applyToOpportunity(
    @Param('opportunityId', ParseUUIDPipe) opportunityId: string,
    @CurrentUser() user: any,
    @Body() applicationData: {
      message: string;
      proposedBudget: number;
      estimatedDuration: string;
      portfolio?: string[];
    },
  ) {
    return this.opportunitiesService.applyToOpportunity(
      user.sub,
      opportunityId,
      applicationData,
    );
  }
}