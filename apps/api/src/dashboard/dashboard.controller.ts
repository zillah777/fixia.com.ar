import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard del usuario' })
  @ApiResponse({ status: 200, description: 'Estadísticas del dashboard' })
  async getDashboardStats(@CurrentUser() user: any) {
    return this.dashboardService.getDashboardStats(user.sub);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Obtener actividad reciente del usuario' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de actividades a retornar' })
  @ApiResponse({ status: 200, description: 'Lista de actividades recientes' })
  async getRecentActivity(
    @CurrentUser() user: any,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.dashboardService.getRecentActivity(user.sub, limit || 10);
  }

  @Get('projects')
  @ApiOperation({ summary: 'Obtener proyectos actuales del usuario' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de proyectos a retornar' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos actuales' })
  async getCurrentProjects(
    @CurrentUser() user: any,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.dashboardService.getCurrentProjects(user.sub, limit || 5);
  }
}
