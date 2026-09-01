import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics & Telemetry')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get institutional analytics overview' })
  async getRootOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get institutional analytics overview, category breakdown, retention' })
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('super-admin')
  @ApiOperation({ summary: 'Get Super Admin platform governance telemetry' })
  async getSuperAdmin() {
    return this.analyticsService.getSuperAdminAnalytics();
  }

  @Get('instructor')
  @ApiOperation({ summary: 'Get Instructor telemetry and course metrics' })
  async getInstructor() {
    return this.analyticsService.getInstructorAnalytics();
  }

  @Get('organization')
  @ApiOperation({ summary: 'Get Organization analytics overview' })
  async getOrganization() {
    return this.analyticsService.getOverview();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue projection and payout liability telemetry' })
  async getRevenue() {
    return this.analyticsService.getRevenueAnalytics();
  }
}
