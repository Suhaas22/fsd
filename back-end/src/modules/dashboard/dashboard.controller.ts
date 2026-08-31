import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get comprehensive executive dashboard overview' })
  @ApiResponse({ status: 200, description: 'Returns high-level KPIs, recent enrollments, transactions, and courses' })
  async getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get live real-time recent administrative activity feed' })
  @ApiResponse({ status: 200, description: 'Returns recent activities' })
  async getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }
}
