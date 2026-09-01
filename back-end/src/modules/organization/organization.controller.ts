import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@ApiTags('Organization')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'Get organization profile details' })
  @ApiResponse({ status: 200, description: 'Returns organization details' })
  async getProfile() {
    return this.organizationService.getProfile();
  }

  @Patch()
  @ApiOperation({ summary: 'Update organization profile details' })
  @ApiResponse({ status: 200, description: 'Organization profile updated successfully' })
  async updateProfile(@Body() dto: UpdateOrganizationDto) {
    return this.organizationService.updateProfile(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dynamic organization telemetry & statistics' })
  @ApiResponse({ status: 200, description: 'Returns aggregated institutional stats' })
  async getStats() {
    return this.organizationService.getStats();
  }

  @Get('student-requests')
  @ApiOperation({ summary: 'Get pending student membership join requests' })
  async getStudentJoinRequests() {
    return this.organizationService.getStudentJoinRequests();
  }

  @Post('student-requests/:id/respond')
  @ApiOperation({ summary: 'Approve or reject a learner membership request' })
  async respondStudentJoinRequest(
    @Param('id') learnerId: string,
    @Body() body: { action: 'approve' | 'reject' }
  ) {
    return this.organizationService.respondStudentJoinRequest(learnerId, body.action);
  }
}
