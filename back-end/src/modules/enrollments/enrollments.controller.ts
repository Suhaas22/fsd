import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import {
  AssignCoursesToLearnersDto,
  EnrollmentQueryDto,
  UpdateEnrollmentProgressDto,
  UpdateEnrollmentStatusDto,
} from './dto/enrollment.dto';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all course enrollments with learner, course, and status filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated enrollments' })
  async findAll(@Query() query: EnrollmentQueryDto) {
    return this.enrollmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single enrollment record details' })
  @ApiResponse({ status: 200, description: 'Returns enrollment details' })
  async findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Batch assign multiple courses to multiple learners atomically with billing transactions' })
  @ApiResponse({ status: 201, description: 'Enrollments and transactions created atomically' })
  async assignCourses(@Body() dto: AssignCoursesToLearnersDto) {
    return this.enrollmentsService.assignCoursesToLearners(dto);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update learner progress (0-100%) for an enrollment' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  async updateProgress(@Param('id') id: string, @Body() dto: UpdateEnrollmentProgressDto) {
    return this.enrollmentsService.updateProgress(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update enrollment status (Active, Completed, Dropped)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateEnrollmentStatusDto) {
    return this.enrollmentsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel/Delete an enrollment record' })
  @ApiResponse({ status: 200, description: 'Enrollment deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.enrollmentsService.delete(id);
  }
}
