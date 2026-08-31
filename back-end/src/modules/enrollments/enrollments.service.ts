import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { JsonDatabaseService } from '../../database/json-db.service';
import {
  AssignCoursesToLearnersDto,
  EnrollmentQueryDto,
  UpdateEnrollmentProgressDto,
  UpdateEnrollmentStatusDto,
} from './dto/enrollment.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class EnrollmentsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS)
    private readonly transactionsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>,
    private readonly dbService: JsonDatabaseService
  ) {}

  async findAll(query: EnrollmentQueryDto) {
    const { page = 1, limit = 10, search, learnerId, courseId, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (learnerId) where.learnerId = learnerId;
    if (courseId) where.courseId = courseId;
    if (status && status !== 'All') where.status = status;

    if (search) {
      where.$or = [
        { learnerName: { $contains: search } },
        { courseTitle: { $contains: search } },
        { id: { $contains: search } },
      ];
    }

    return this.enrollmentsRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string) {
    const enrollment = await this.enrollmentsRepo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID '${id}' not found`);
    }
    return enrollment;
  }

  /**
   * Atomic Multi-Course & Multi-Learner Assignment
   */
  async assignCoursesToLearners(dto: AssignCoursesToLearnersDto) {
    if (!dto.courseIds?.length || !dto.learnerIds?.length) {
      throw new BadRequestException('courseIds and learnerIds must not be empty');
    }

    return this.dbService.runTransaction(async () => {
      const allCourses = await this.coursesRepo.find();
      const allLearners = await this.learnersRepo.find();

      const targetCourses = allCourses.filter((c) => dto.courseIds.includes(c.id));
      const targetLearners = allLearners.filter((l) => dto.learnerIds.includes(l.id));

      if (targetCourses.length === 0) {
        throw new NotFoundException('None of the specified courses were found');
      }
      if (targetLearners.length === 0) {
        throw new NotFoundException('None of the specified learners were found');
      }

      const createdEnrollments = [];
      const createdTransactions = [];
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const nowIso = new Date().toISOString();

      for (const course of targetCourses) {
        for (const learner of targetLearners) {
          // Check if already actively enrolled
          const existing = await this.enrollmentsRepo.findOne({
            learnerId: learner.id,
            courseId: course.id,
          });

          if (!existing) {
            const enrId = `ENR-${Math.floor(100000 + Math.random() * 900000)}`;
            const enrollment = await this.enrollmentsRepo.create({
              id: enrId,
              learnerId: learner.id,
              learnerName: learner.name,
              learnerAvatar: learner.avatar,
              courseId: course.id,
              courseTitle: course.title,
              enrolledDate: dateStr,
              progress: 0,
              status: 'Active',
              lastAccessed: dateStr,
              createdAt: nowIso,
            });
            createdEnrollments.push(enrollment);

            // Record transaction ledger entry
            const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
            const transaction = await this.transactionsRepo.create({
              id: txnId,
              payer: learner.name,
              course: course.title,
              amount: course.price,
              type: 'Payment',
              method: 'NexusPay Enterprise Billing',
              date: `${dateStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              status: 'Completed',
              createdAt: nowIso,
            });
            createdTransactions.push(transaction);
          }
        }

        // Update Course seats and revenue
        const additionalSeats = targetLearners.length;
        await this.coursesRepo.update(course.id, {
          enrolledCount: (course.enrolledCount || 0) + additionalSeats,
          revenue: (course.revenue || 0) + course.price * additionalSeats,
        });
      }

      // Update Learners enrolled count
      for (const learner of targetLearners) {
        await this.learnersRepo.update(learner.id, {
          enrolledCourses: (learner.enrolledCourses || 0) + targetCourses.length,
          totalSpent: (learner.totalSpent || 0) + targetCourses.reduce((sum, c) => sum + c.price, 0),
        });
      }

      // Add Notification
      await this.notifsRepo.create({
        title: `Batch Course Assignment Completed`,
        desc: `Enrolled ${targetLearners.length} learner(s) into ${targetCourses.length} course track(s).`,
        time: 'Just now',
        category: 'Course',
        read: false,
        color: 'green',
      });

      return {
        totalAssigned: createdEnrollments.length,
        enrollments: createdEnrollments,
        transactions: createdTransactions,
      };
    });
  }

  async updateProgress(id: string, dto: UpdateEnrollmentProgressDto) {
    const enrollment = await this.enrollmentsRepo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID '${id}' not found`);
    }

    const isCompleted = dto.progress >= 100;
    const updated = await this.enrollmentsRepo.update(id, {
      progress: dto.progress,
      status: isCompleted ? 'Completed' : enrollment.status,
      lastAccessed: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });

    if (isCompleted && enrollment.status !== 'Completed') {
      // Update learner completed courses count
      const learner = await this.learnersRepo.findById(enrollment.learnerId);
      if (learner) {
        await this.learnersRepo.update(learner.id, {
          completedCourses: (learner.completedCourses || 0) + 1,
          certificatesCount: (learner.certificatesCount || 0) + 1,
        });
      }
    }

    return updated;
  }

  async updateStatus(id: string, dto: UpdateEnrollmentStatusDto) {
    const enrollment = await this.enrollmentsRepo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID '${id}' not found`);
    }
    return this.enrollmentsRepo.update(id, { status: dto.status });
  }

  async delete(id: string) {
    const enrollment = await this.enrollmentsRepo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID '${id}' not found`);
    }
    return this.enrollmentsRepo.delete(id);
  }
}
