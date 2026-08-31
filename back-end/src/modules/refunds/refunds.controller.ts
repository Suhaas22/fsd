import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RefundsService } from './refunds.service';

@ApiTags('Platform Admin - Refunds & Chargebacks')
@Controller('refunds')
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all processed and pending refunds' })
  findAll() {
    return this.refundsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get refund details' })
  findOne(@Param('id') id: string) {
    return this.refundsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Process a course refund' })
  create(@Body() body: any) {
    return this.refundsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update refund status' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.refundsService.update(id, body);
  }
}
