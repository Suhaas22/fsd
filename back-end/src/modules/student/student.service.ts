import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { UpdateStudentProfileDto, StudentCheckoutDto } from './dto/student.dto';

@Injectable()
export class StudentService {
  constructor(
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.CERTIFICATES)
    private readonly certificatesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS)
    private readonly transactionsRepo: JsonRepository<any>
  ) {}

  async getProfile(userId: string) {
    const learner = await this.learnersRepo.findById(userId) || (await this.learnersRepo.find())[0];
    return learner;
  }

  async updateProfile(userId: string, dto: UpdateStudentProfileDto) {
    const learner = await this.getProfile(userId);
    const updated = await this.learnersRepo.update(learner.id, dto);
    return updated;
  }

  async getEnrollments(userId: string) {
    const learner = await this.getProfile(userId);
    const enrollments = await this.enrollmentsRepo.find({
      where: { learnerId: learner.id },
    });
    return enrollments;
  }

  async enrollCourse(userId: string, courseId: string) {
    const learner = await this.getProfile(userId);
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course '${courseId}' not found`);
    }

    const existing = await this.enrollmentsRepo.findOne({
      learnerId: learner.id,
      courseId: courseId,
    });

    if (existing) {
      return existing;
    }

    const newEnrollment = await this.enrollmentsRepo.create({
      id: `enr-${Date.now()}`,
      learnerId: learner.id,
      learnerName: learner.name,
      learnerEmail: learner.email,
      learnerAvatar: learner.avatar,
      courseId: course.id,
      courseTitle: course.title,
      enrolledDate: new Date().toISOString().split('T')[0],
      enrolledAt: new Date().toISOString(),
      progress: 0,
      status: 'Active',
    });

    // Increment course enrolled count
    await this.coursesRepo.update(course.id, {
      enrolledCount: (course.enrolledCount || 0) + 1,
    });

    return newEnrollment;
  }

  async updateProgress(userId: string, enrollmentId: string, lessonId: string, completed: boolean) {
    const enrollment = await this.enrollmentsRepo.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment '${enrollmentId}' not found`);
    }

    const completedLessons = new Set<string>(enrollment.completedLessons || []);
    if (completed) {
      completedLessons.add(lessonId);
    } else {
      completedLessons.delete(lessonId);
    }

    const course = await this.coursesRepo.findById(enrollment.courseId);
    const totalLessons = course?.lessonsCount || 10;
    const progress = Math.min(100, Math.round((completedLessons.size / totalLessons) * 100));

    const status = progress >= 100 ? 'Completed' : 'Active';

    const updated = await this.enrollmentsRepo.update(enrollmentId, {
      completedLessons: Array.from(completedLessons),
      progress,
      status,
    });

    return updated;
  }

  async getCertificates(userId: string) {
    const learner = await this.getProfile(userId);
    return this.certificatesRepo.find({
      where: { learnerId: learner.id },
    });
  }

  async getPayments(userId: string) {
    const learner = await this.getProfile(userId);
    return this.transactionsRepo.find({
      where: { learnerId: learner.id },
    });
  }

  async checkout(userId: string, dto: StudentCheckoutDto) {
    const learner = await this.getProfile(userId);
    const course = await this.coursesRepo.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException(`Course '${dto.courseId}' not found`);
    }

    const price = dto.amount || course.price || 99;
    const transaction = await this.transactionsRepo.create({
      id: `TXN-${Date.now()}`,
      learnerId: learner.id,
      payer: learner.name,
      payerEmail: learner.email,
      courseId: course.id,
      course: course.title,
      courseTitle: course.title,
      amount: price,
      method: dto.paymentMethod,
      paymentMethod: dto.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'Completed',
      type: 'Tuition',
      facultyRoyalty: Math.round(price * 0.7 * 100) / 100,
      platformFee: Math.round(price * 0.3 * 100) / 100,
    });

    // Automatically enroll student
    await this.enrollCourse(userId, course.id);

    return {
      success: true,
      transaction,
      message: `Enrolled in ${course.title} successfully!`,
    };
  }
}
