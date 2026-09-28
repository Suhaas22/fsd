import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';

@ApiTags('Organizations - Directory & Governance')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'List all institutions and organizations with 85/15 revenue split' })
  async findAll() {
    return this.organizationService.findAllOrgs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization details and instructors by ID' })
  async findOne(@Param('id') id: string) {
    return this.organizationService.findOrgById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new institution/organization partner' })
  async create(@Body() body: any) {
    return this.organizationService.createOrg(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization profile and status' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.organizationService.updateOrg(id, body);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verify organization accreditation' })
  async verify(@Param('id') id: string, @Body() body: any) {
    return this.organizationService.updateOrg(id, { status: 'Verified', ...body });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization record' })
  async delete(@Param('id') id: string) {
    return this.organizationService.deleteOrg(id);
  }
}

