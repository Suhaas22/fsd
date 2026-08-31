import { Body, Controller, Get, Patch } from '@nestjs/common';
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
}
