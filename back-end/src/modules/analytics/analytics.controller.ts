import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics & Telemetry')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get institutional analytics overview, category breakdown, retention' })
  @ApiResponse({ status: 200, description: 'Returns analytics dashboard data' })
  async getOverview() {
    return this.analyticsService.getOverview();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue projection and payout liability telemetry' })
  @ApiResponse({ status: 200, description: 'Returns revenue telemetry' })
  async getRevenue() {
    return this.analyticsService.getRevenueAnalytics();
  }
}
