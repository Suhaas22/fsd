import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto, ReportQueryDto } from './dto/report.dto';

@ApiTags('Reports & Exports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'List all generated executive and compliance reports' })
  @ApiResponse({ status: 200, description: 'Returns paginated reports' })
  async findAll(@Query() query: ReportQueryDto) {
    return this.reportsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report metadata details' })
  @ApiResponse({ status: 200, description: 'Returns report details' })
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Trigger dynamic report generation based on live database state' })
  @ApiResponse({ status: 201, description: 'Report generated successfully' })
  async generate(@Body() dto: GenerateReportDto) {
    return this.reportsService.generate(dto);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export and download report data as CSV and JSON dataset' })
  @ApiResponse({ status: 200, description: 'Returns CSV and formatted dataset' })
  async exportReport(@Param('id') id: string) {
    return this.reportsService.exportReportData(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report record' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.reportsService.delete(id);
  }
}
