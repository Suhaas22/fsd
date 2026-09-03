import { Controller, Get, Post, Patch, Body, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, SubmitQuizDto, CreateQuizQuestionDto } from './dto/quizzes.dto';

@ApiTags('Quizzes & Academic Assessments')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all quizzes' })
  findAll() {
    return this.quizzesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID with questions' })
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get quiz associated with a course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.findByCourse(courseId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course quiz' })
  create(@Body() dto: CreateQuizDto) {
    return this.quizzesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quiz and replace its question set' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.quizzesService.update(id, body);
  }

  @Post('questions')
  @ApiOperation({ summary: 'Add a question to a quiz pool' })
  addQuestion(@Body() dto: CreateQuizQuestionDto) {
    return this.quizzesService.addQuestion(dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit quiz answers and get evaluation result' })
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
    @Headers('x-user-id') userId: string = 'lrn-1'
  ) {
    return this.quizzesService.submitQuiz(id, dto, userId);
  }
}
