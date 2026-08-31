import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import {
  CreateDisputeDto,
  DisputeQueryDto,
  ResolveDisputeDto,
  UpdateDisputeStatusDto,
} from './dto/dispute.dto';

@ApiTags('Disputes & Governance')
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  @ApiOperation({ summary: 'List all organization disputes with status, priority filters and search' })
  @ApiResponse({ status: 200, description: 'Returns paginated disputes list' })
  async findAll(@Query() query: DisputeQueryDto) {
    return this.disputesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute ticket details and history' })
  @ApiResponse({ status: 200, description: 'Returns dispute details' })
  async findOne(@Param('id') id: string) {
    return this.disputesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Raise a new dispute ticket (Royalty, Content Quality, Plagiarism, IP)' })
  @ApiResponse({ status: 201, description: 'Dispute ticket logged successfully' })
  async create(@Body() dto: CreateDisputeDto) {
    return this.disputesService.create(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update dispute workflow status (Open, Under Review, Escalated, Resolved)' })
  @ApiResponse({ status: 200, description: 'Dispute status updated successfully' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateDisputeStatusDto) {
    return this.disputesService.updateStatus(id, dto);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve a dispute ticket with formal resolution rationale' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  async resolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputesService.resolve(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a dispute ticket' })
  @ApiResponse({ status: 200, description: 'Dispute deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.disputesService.delete(id);
  }
}
