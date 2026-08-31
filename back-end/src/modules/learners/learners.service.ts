import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { CreateLearnerDto, LearnerQueryDto, UpdateLearnerDto } from './dto/learner.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class LearnersService {
  constructor(
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>
  ) {}

  async findAll(query: LearnerQueryDto) {
    const { page = 1, limit = 10, search, learnerType, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (learnerType && learnerType !== 'All') {
      where.learnerType = learnerType;
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (search) {
      where.$or = [
        { name: { $contains: search } },
        { email: { $contains: search } },
        { university: { $contains: search } },
      ];
    }

    return this.learnersRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string) {
    const learner = await this.learnersRepo.findById(id);
    if (!learner) {
      throw new NotFoundException(`Learner with ID '${id}' not found`);
    }

    const enrollments = await this.enrollmentsRepo.find({
      where: { learnerId: id },
    });

    return {
      ...learner,
      enrollments,
    };
  }

  async create(dto: CreateLearnerDto) {
    const newLearner = await this.learnersRepo.create({
      ...dto,
      enrolledCourses: 0,
      completedCourses: 0,
      overallProgress: 0,
      avgScore: '0%',
      certificatesCount: 0,
      status: dto.status || 'Active',
      totalSpent: 0,
      avatar: dto.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      joinedDate: dto.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
    return newLearner;
  }

  async update(id: string, dto: UpdateLearnerDto) {
    const existing = await this.learnersRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Learner with ID '${id}' not found`);
    }
    return this.learnersRepo.update(id, dto);
  }

  async delete(id: string) {
    const existing = await this.learnersRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Learner with ID '${id}' not found`);
    }
    return this.learnersRepo.delete(id);
  }

  async getLearnerEnrollments(id: string) {
    await this.findOne(id);
    return this.enrollmentsRepo.find({
      where: { learnerId: id },
    });
  }
}
