import { Controller, Get, Query, UseGuards, Request, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity for the authenticated user' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of activities to return (default: 10)' })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getActivity(
    @Request() req,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.userId;
    const activities = await this.dashboardService.getRecentActivity(userId, limit);

    return {
      success: true,
      data: activities,
    };
  }

  @Get('projects')
  @ApiOperation({ summary: 'Get current active projects for the authenticated user' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of projects to return (default: 5)' })
  @ApiResponse({ status: 200, description: 'Current projects retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getProjects(
    @Request() req,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    const userId = req.user.userId;
    const projects = await this.dashboardService.getCurrentProjects(userId, limit);

    return {
      success: true,
      data: projects,
    };
  }
}
