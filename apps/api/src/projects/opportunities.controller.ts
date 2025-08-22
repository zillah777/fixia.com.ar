import { 
  Controller, 
  Get, 
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Oportunidades')
@Controller('opportunities')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('professional')
@ApiBearerAuth()
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
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
  @ApiOperation({ summary: 'Obtener estadísticas de oportunidades del profesional' })
  @ApiResponse({ status: 200, description: 'Estadísticas de oportunidades y propuestas' })
  @ApiResponse({ status: 403, description: 'Solo profesionales pueden ver estadísticas' })
  getStats(@CurrentUser() user: any) {
    return this.opportunitiesService.getOpportunityStats(user.sub);
  }
}