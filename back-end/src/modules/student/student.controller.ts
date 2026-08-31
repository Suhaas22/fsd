import { Controller, Get, Put, Post, Patch, Body, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { UpdateStudentProfileDto, StudentCheckoutDto, StudentEnrollDto, UpdateProgressDto } from './dto/student.dto';

@ApiTags('Student & Learner LMS')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get student academic profile and university affiliation' })
  async getProfile(@Headers('x-user-id') userId: string = 'lrn-1') {
    return this.studentService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update student academic profile details' })
  async updateProfile(
    @Body() dto: UpdateStudentProfileDto,
    @Headers('x-user-id') userId: string = 'lrn-1'
  ) {
    return this.studentService.updateProfile(userId, dto);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'List all enrolled courses and progress metrics' })
  async getEnrollments(@Headers('x-user-id') userId: string = 'lrn-1') {
    return this.studentService.getEnrollments(userId);
  }

  @Post('enrollments')
  @ApiOperation({ summary: 'Enroll in a course' })
  async enroll(
    @Body() dto: StudentEnrollDto,
    @Headers('x-user-id') userId: string = 'lrn-1'
  ) {
    return this.studentService.enrollCourse(userId, dto.courseId);
  }

  @Patch('enrollments/:id/progress')
  @ApiOperation({ summary: 'Update module/lesson completion and recalculate progress' })
  async updateProgress(
    @Param('id') enrollmentId: string,
    @Body() dto: UpdateProgressDto,
    @Headers('x-user-id') userId: string = 'lrn-1'
  ) {
    return this.studentService.updateProgress(userId, enrollmentId, dto.lessonId, dto.completed);
  }

  @Get('certificates')
  @ApiOperation({ summary: 'List verified student credentials and certificates' })
  async getCertificates(@Headers('x-user-id') userId: string = 'lrn-1') {
    return this.studentService.getCertificates(userId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get student tuition and course payment history' })
  async getPayments(@Headers('x-user-id') userId: string = 'lrn-1') {
    return this.studentService.getPayments(userId);
  }

  @Post('payments/checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute course enrollment checkout with NexusPay' })
  async checkout(
    @Body() dto: StudentCheckoutDto,
    @Headers('x-user-id') userId: string = 'lrn-1'
  ) {
    return this.studentService.checkout(userId, dto);
  }
}
