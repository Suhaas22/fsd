import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LearnersService } from './learners.service';
import { CreateLearnerDto, LearnerQueryDto, UpdateLearnerDto } from './dto/learner.dto';

@ApiTags('Learners')
@Controller('learners')
export class LearnersController {
  constructor(private readonly learnersService: LearnersService) {}

  @Get()
  @ApiOperation({ summary: 'List all enrolled learners (students & professionals)' })
  @ApiResponse({ status: 200, description: 'Returns paginated learners list' })
  async findAll(@Query() query: LearnerQueryDto) {
    return this.learnersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get learner profile and their enrolled courses' })
  @ApiResponse({ status: 200, description: 'Returns learner profile and enrollments' })
  async findOne(@Param('id') id: string) {
    return this.learnersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register/Add a new learner' })
  @ApiResponse({ status: 201, description: 'Learner registered successfully' })
  async create(@Body() dto: CreateLearnerDto) {
    return this.learnersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update learner details or academic metrics' })
  @ApiResponse({ status: 200, description: 'Learner updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateLearnerDto) {
    return this.learnersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a learner record' })
  @ApiResponse({ status: 200, description: 'Learner deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.learnersService.delete(id);
  }

  @Get(':id/enrollments')
  @ApiOperation({ summary: 'Get course enrollments for this learner' })
  @ApiResponse({ status: 200, description: 'Returns enrollments list' })
  async getEnrollments(@Param('id') id: string) {
    return this.learnersService.getLearnerEnrollments(id);
  }
}
