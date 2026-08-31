import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';

@ApiTags('Certificates & Verified Credentials')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all awarded certificates' })
  findAll() {
    return this.certificatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate details by certificate or credential ID' })
  findOne(@Param('id') id: string) {
    return this.certificatesService.findOne(id);
  }

  @Get('verify/:credentialId')
  @ApiOperation({ summary: 'Public endpoint to verify certificate credential ID' })
  verify(@Param('credentialId') credentialId: string) {
    return this.certificatesService.verify(credentialId);
  }

  @Post()
  @ApiOperation({ summary: 'Issue a new certificate' })
  create(@Body() body: any) {
    return this.certificatesService.create(body);
  }
}
