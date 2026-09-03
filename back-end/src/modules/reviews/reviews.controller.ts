import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews & Course Ratings')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews across courses' })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all reviews for a course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.reviewsService.findByCourse(courseId);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a student review and rating for a course' })
  create(@Body() body: any) {
    return this.reviewsService.create(body);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Instructor reply to a student review' })
  reply(@Param('id') id: string, @Body() body: { response: string }) {
    return this.reviewsService.reply(id, body.response);
  }

  @Delete(':id/reply')
  @ApiOperation({ summary: 'Delete instructor reply to a student review' })
  deleteReply(@Param('id') id: string) {
    return this.reviewsService.deleteReply(id);
  }
}

