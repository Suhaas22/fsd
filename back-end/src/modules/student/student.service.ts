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
    private readonly transactionsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATION)
    private readonly orgsRepo: JsonRepository<any>
  ) {}

  async getProfile(userId: string) {
    const learner = (await this.learnersRepo.findById(userId)) || (await this.learnersRepo.find())[0];
    if (!learner) {
      return {
        id: 'lrn-1',
        name: 'Alex Chen',
        email: 'alex.chen@stanford.edu',
        learnerType: 'Learner',
        orgMembershipStatus: 'Independent Learner',
        university: 'Independent Learner',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        enrolledCourses: 5,
        completedCourses: 2,
        certificatesCount: 2,
        streakDays: 14,
        weeklyGoalHours: 10,
        completedHoursThisWeek: 8.5,
      };
    }

    if (!learner.orgMembershipStatus) {
      learner.orgMembershipStatus = learner.university && learner.university !== 'Independent Learner' 
        ? 'Verified Student' 
        : 'Independent Learner';
    }

    return learner;
  }

  async updateProfile(userId: string, dto: UpdateStudentProfileDto) {
    const learner = await this.getProfile(userId);
    const updated = await this.learnersRepo.update(learner.id, dto);
    return updated;
  }

  async requestJoinOrganization(userId: string, orgId: string, orgName: string) {
    const learner = await this.getProfile(userId);
    const updated = await this.learnersRepo.update(learner.id, {
      orgMembershipStatus: 'Pending Organization Approval',
      requestedOrgId: orgId,
      requestedOrgName: orgName,
      requestedAt: new Date().toISOString(),
    });
    return updated;
  }

  async getOrganizationsList() {
    const orgs = await this.orgsRepo.find();
    if (orgs.length === 0) {
      return [
        { id: 'org-101', name: 'Stanford University', domain: 'stanford.edu', location: 'Palo Alto, CA', verificationStatus: 'Verified Institution' },
        { id: 'org-102', name: 'MIT - Massachusetts Institute of Technology', domain: 'mit.edu', location: 'Cambridge, MA', verificationStatus: 'Verified Institution' },
        { id: 'org-103', name: 'NexusPay Enterprise Academy', domain: 'nexuspay.edu', location: 'San Francisco, CA', verificationStatus: 'Verified Institution' },
      ];
    }
    return orgs;
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
    const certificates = await this.certificatesRepo.find({
      where: { learnerId: learner.id },
    });
    if (certificates.length === 0) {
      return [
        {
          id: 'crt-101',
          learnerId: learner.id,
          courseTitle: 'Advanced Enterprise Architecture & Payment Systems',
          category: 'Professional Certificates',
          issueDate: 'August 2026',
          credentialId: 'NX-CERT-884920',
          verifiedUrl: 'https://nexuspay-verify.org/cert/NX-CERT-884920',
        },
        {
          id: 'crt-102',
          learnerId: learner.id,
          courseTitle: 'Cloud Security, SOC2 & FinTech Compliance',
          category: 'Course Certificates',
          issueDate: 'July 2026',
          credentialId: 'NX-CERT-773821',
          verifiedUrl: 'https://nexuspay-verify.org/cert/NX-CERT-773821',
        },
      ];
    }
    return certificates;
  }

  async getPayments(userId: string) {
    const learner = await this.getProfile(userId);
    const transactions = await this.transactionsRepo.find({
      where: { payerId: learner.id },
    });
    return transactions;
  }

  async checkout(userId: string, dto: StudentCheckoutDto) {
    const learner = await this.getProfile(userId);
    const course = await this.coursesRepo.findById(dto.courseId);

    const transaction = await this.transactionsRepo.create({
      id: `tx-${Date.now()}`,
      payerId: learner.id,
      payerName: learner.name,
      payerEmail: learner.email,
      courseId: dto.courseId,
      courseTitle: course?.title || 'Masterclass Track',
      amount: dto.amount || course?.price || 89.99,
      paymentMethod: dto.paymentMethod || 'Credit Card',
      status: 'Paid',
      timestamp: new Date().toISOString(),
    });

    await this.enrollCourse(userId, dto.courseId);

    return {
      success: true,
      transactionId: transaction.id,
      courseTitle: course?.title || 'Masterclass Track',
      amount: transaction.amount,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };
  }
}
