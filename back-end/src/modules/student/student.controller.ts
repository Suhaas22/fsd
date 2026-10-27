import { Controller, Get, Put, Post, Patch, Body, Param, Headers, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { UpdateStudentProfileDto, StudentCheckoutDto, StudentEnrollDto, UpdateProgressDto } from './dto/student.dto';

@ApiTags('Student & Learner LMS')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get learner profile with stats computed from enrollments and certificates' })
  getProfile(@Headers('x-user-id') userId: string) {
    return this.studentService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update learner profile details' })
  updateProfile(@Body() dto: UpdateStudentProfileDto, @Headers('x-user-id') userId: string) {
    return this.studentService.updateProfile(userId, dto);
  }

  @Get('organizations')
  @ApiOperation({ summary: 'List organizations learners can request to join' })
  getOrganizations() {
    return this.studentService.getOrganizationsList();
  }

  @Post('join-organization')
  @ApiOperation({ summary: 'Request to join an organization' })
  requestJoinOrganization(
    @Body() body: { organizationId: string; organizationName: string },
    @Headers('x-user-id') userId: string,
  ) {
    return this.studentService.requestJoinOrganization(userId, body.organizationId, body.organizationName);
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Published courses that have an assigned instructor' })
  getCatalog() {
    return this.studentService.getCatalog();
  }

  @Get('catalog/browse') browse(@Headers('x-user-id') userId:string,@Query() query:any){return this.studentService.browse(userId,query);}

  @Get('catalog/:courseId')
  @ApiOperation({ summary: 'Single available catalog course' })
  getCatalogCourse(@Param('courseId') courseId: string) {
    return this.studentService.getCatalogCourse(courseId);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'List enrolled courses with progress' })
  getEnrollments(@Headers('x-user-id') userId: string) {
    return this.studentService.getEnrollments(userId);
  }

  @Get('enrollments/course/:courseId')
  @ApiOperation({ summary: 'Get the learner enrollment for a course' })
  getEnrollmentForCourse(@Param('courseId') courseId: string, @Headers('x-user-id') userId: string) {
    return this.studentService.getEnrollmentForCourse(userId, courseId);
  }

  @Post('enrollments')
  @ApiOperation({ summary: 'Enroll in a free course' })
  enroll(@Body() dto: StudentEnrollDto, @Headers('x-user-id') userId: string) {
    return this.studentService.enrollCourse(userId, dto.courseId);
  }

  @Patch('enrollments/:id/progress')
  @ApiOperation({ summary: 'Mark a lesson complete/incomplete; issues a certificate at 100%' })
  updateProgress(
    @Param('id') enrollmentId: string,
    @Body() dto: UpdateProgressDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.studentService.updateProgress(userId, enrollmentId, dto.lessonId, dto.completed);
  }

  @Get('certificates')
  @ApiOperation({ summary: 'List learner certificates' })
  getCertificates(@Headers('x-user-id') userId: string) {
    return this.studentService.getCertificates(userId);
  }

  @Get('certificates/:id/download') downloadCertificate(@Headers('x-user-id') userId:string,@Param('id') id:string){return this.studentService.downloadCertificate(userId,id);}

  @Get('billing') billing(@Headers('x-user-id') userId:string,@Query() query:any){return this.studentService.billing(userId,query);}
  @Get('payments/:id') receipt(@Headers('x-user-id') userId:string,@Param('id') id:string){return this.studentService.receipt(userId,id);}
  @Get('courses/:courseId/content') content(@Headers('x-user-id') userId:string,@Param('courseId') courseId:string){return this.studentService.content(userId,courseId);}
  @Get('dispute-categories') categories(){return this.studentService.disputeCategories();}
  @Post('courses/:courseId/activity') activity(@Headers('x-user-id') userId:string,@Param('courseId') id:string,@Body() body:any){return this.studentService.recordEngagement(userId,id,body);}
  @Get('disputes') disputes(@Headers('x-user-id') userId:string){return this.studentService.myDisputes(userId);}
  @Get('disputes/:id') dispute(@Headers('x-user-id') userId:string,@Param('id') id:string){return this.studentService.dispute(userId,id);}
  @Post('disputes') createDispute(@Headers('x-user-id') userId:string,@Body() body:any){return this.studentService.createDispute(userId,body);}
  @Post('disputes/:id/comments') comment(@Headers('x-user-id') userId:string,@Param('id') id:string,@Body() body:any){return this.studentService.comment(userId,id,body);}
  @Get('assessments/:courseId') assessment(@Headers('x-user-id') userId:string,@Param('courseId') courseId:string){return this.studentService.assessment(userId,courseId);}
  @Post('assessments/:courseId/submit') submitAssessment(@Headers('x-user-id') userId:string,@Param('courseId') courseId:string,@Body() body:any){return this.studentService.submitAssessment(userId,courseId,body);}
  @Get('payments')
  @ApiOperation({ summary: 'Learner payment history' })
  getPayments(@Headers('x-user-id') userId: string) {
    return this.studentService.getPayments(userId);
  }

  @Post('payments/checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay for a course (card or UPI) and enroll' })
  checkout(@Body() dto: StudentCheckoutDto, @Headers('x-user-id') userId: string) {
    return this.studentService.checkout(userId, dto);
  }
}
