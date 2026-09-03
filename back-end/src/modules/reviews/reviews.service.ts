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
    const course = data?.courseId ? await this.coursesRepo.findById(data.courseId) : null;
    const review = await this.reviewsRepo.create({
      learnerId: data?.learnerId || 'lrn-1',
      learnerName: data?.learnerName || data?.userName || 'Student',
      learnerAvatar: data?.learnerAvatar || data?.avatar || '',
      courseId: data?.courseId || '',
      courseTitle: course?.title || data?.courseTitle || '',
      rating: Number(data?.rating) || 5,
      comment: data?.comment || data?.content || data?.review || '',
      createdAt: data?.createdAt || new Date().toISOString(),
      ...data,
    });
    return review;
  }

  async reply(id: string, responseText: string) {
    const review = await this.reviewsRepo.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with ID '${id}' not found`);
    }

    const updated = await this.reviewsRepo.update(id, {
      response: responseText,
      repliedAt: new Date().toISOString(),
    });

    return updated;
  }

  async deleteReply(id: string) {
    const review = await this.reviewsRepo.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with ID '${id}' not found`);
    }

    const updated = await this.reviewsRepo.update(id, {
      response: null,
      repliedAt: null,
    });

    return updated;
  }
}

