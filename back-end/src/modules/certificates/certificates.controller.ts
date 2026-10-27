import {Inject,Headers,ForbiddenException} from '@nestjs/common';
import {REPOSITORY_TOKENS} from '../../database/database.module';
import {JsonRepository} from '../../database/json-repository';
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';

@ApiTags('Certificates & Verified Credentials')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService,@Inject(REPOSITORY_TOKENS.USERS) private readonly users:JsonRepository<any>) {}

  @Get()
  @ApiOperation({ summary: 'Get all awarded certificates' })
  findAll() {
    return this.certificatesService.findAll();
  }

  @Get(':id/download')
  async download(@Param('id') id:string,@Headers('x-user-id') userId:string,@Headers('authorization') authorization:string){const account=await this.users.findById(userId||String(authorization||'').replace(/^Bearer\s+/i,'').match(/^jwt-token-(.+)-\d+$/)?.[1]);if(!account||!['admin','superadmin'].includes(String(account.role).toLowerCase().replace(/[\s_-]/g,''))||account.status!=='Active')throw new ForbiddenException('Administrator access is required.');return this.certificatesService.download(id);}

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
