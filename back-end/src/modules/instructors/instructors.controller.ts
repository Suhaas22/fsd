import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InstructorsService } from './instructors.service';
import { CreateInstructorDto, InstructorQueryDto, UpdateInstructorDto } from './dto/instructor.dto';

@ApiTags('Instructors')
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all instructors with filtering, search, and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated instructors list' })
  async findAll(@Query() query: InstructorQueryDto) {
    return this.instructorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get instructor details and associated authored courses' })
  @ApiResponse({ status: 200, description: 'Returns instructor profile and courses' })
  async findOne(@Param('id') id: string) {
    return this.instructorsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register/Add a new instructor' })
  @ApiResponse({ status: 201, description: 'Instructor created successfully' })
  async create(@Body() dto: CreateInstructorDto) {
    return this.instructorsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update instructor details' })
  @ApiResponse({ status: 200, description: 'Instructor updated successfully' })
  async update(@Param('id') id: string, @Body() dto: UpdateInstructorDto) {
    return this.instructorsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an instructor record' })
  @ApiResponse({ status: 200, description: 'Instructor deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.instructorsService.delete(id);
  }

  @Get(':id/courses')
  @ApiOperation({ summary: 'Get courses authored or co-instructed by this instructor' })
  @ApiResponse({ status: 200, description: 'Returns courses list' })
  async getCourses(@Param('id') id: string) {
    return this.instructorsService.getInstructorCourses(id);
  }
}
