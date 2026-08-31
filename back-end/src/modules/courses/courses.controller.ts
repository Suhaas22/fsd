import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List all courses with category, level, status filters and search' })
  @ApiResponse({ status: 200, description: 'Returns paginated courses list' })
  async findAll(@Query() query: CourseQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed course information with modules and instructors' })
  @ApiResponse({ status: 200, description: 'Returns course details' })
  async findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course with multi-instructor team and curriculum modules' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  async create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update/Replace course details' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  async updateFull(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update course details' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  async updatePartial(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course record' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.coursesService.delete(id);
  }
}
