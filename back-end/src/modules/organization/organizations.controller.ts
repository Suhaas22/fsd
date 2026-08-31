import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';

@ApiTags('Organizations - Directory & Governance')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'List all institutions and organizations' })
  async findAll() {
    const profile = await this.organizationService.getProfile();
    return [profile];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization details by ID' })
  async findOne(@Param('id') id: string) {
    return this.organizationService.getProfile();
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verify organization accreditation' })
  async verify(@Param('id') id: string, @Body() body: any) {
    return this.organizationService.updateProfile({ status: 'Verified', ...body } as any);
  }
}
