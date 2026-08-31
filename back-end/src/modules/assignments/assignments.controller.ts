import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';

@ApiTags('Assignments & Practical Submissions')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all course assignments' })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment details and submissions' })
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get assignments for a specific course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.assignmentsService.findByCourse(courseId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new practical assignment' })
  create(@Body() body: any) {
    return this.assignmentsService.create(body);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit an assignment solution' })
  submit(@Param('id') id: string, @Body() body: any) {
    return this.assignmentsService.submit(id, body);
  }

  @Post('submissions/:id/grade')
  @ApiOperation({ summary: 'Grade a student submission' })
  grade(
    @Param('id') id: string,
    @Body() body: { score: number; feedback: string }
  ) {
    return this.assignmentsService.gradeSubmission(id, body.score, body.feedback);
  }
}
