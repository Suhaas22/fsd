import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.REVIEWS)
    private readonly reviewsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>
  ) {}

  async findAll() {
    return this.reviewsRepo.find();
  }

  async findByCourse(courseId: string) {
    return this.reviewsRepo.find({ where: { courseId } });
  }

  async create(data: any) {
    const newReview = await this.reviewsRepo.create({
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...data,
    });

    // Update course average rating
    if (data.courseId) {
      const courseReviews = await this.reviewsRepo.find({ where: { courseId: data.courseId } });
      const avg = courseReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / (courseReviews.length || 1);
      await this.coursesRepo.update(data.courseId, { rating: Math.round(avg * 10) / 10 });
    }

    return newReview;
  }
}
