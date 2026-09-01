import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @Inject(REPOSITORY_TOKENS.ORGANIZATION)
    private readonly orgRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTOR_REQUESTS)
    private readonly requestsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.DISPUTES)
    private readonly disputesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>
  ) {}

  async getProfile() {
    const orgs = await this.orgRepo.find();
    if (orgs.length === 0) {
      throw new NotFoundException('Organization details not found');
    }
    return orgs[0];
  }

  async updateProfile(dto: UpdateOrganizationDto) {
    const orgs = await this.orgRepo.find();
    if (orgs.length === 0) {
      return this.orgRepo.create(dto as any);
    }
    return this.orgRepo.update(orgs[0].id, dto);
  }

  async getStats() {
    const [
      totalInstructors,
      totalLearners,
      courses,
      enrollments,
      pendingRequests,
      openDisputes,
      unreadNotifs,
    ] = await Promise.all([
      this.instructorsRepo.count(),
      this.learnersRepo.count(),
      this.coursesRepo.find(),
      this.enrollmentsRepo.find(),
      this.requestsRepo.count({
        status: { $regex: /pending|sent/i },
      }),
      this.disputesRepo.count({
        status: { $ne: 'Resolved' },
      }),
      this.notifsRepo.count({ read: false }),
    ]);

    const activeCourses = courses.filter((c) => c.status === 'Published').length;
    const annualRevenue = courses.reduce(
      (sum, c) => sum + (c.revenue || c.price * (c.enrolledCount || 10)),
      0
    );
    const monthlyRevenue = Math.round(annualRevenue * 0.3);

    const completedEnrollments = enrollments.filter(
      (e) => e.status === 'Completed' || e.progress === 100
    ).length;
    const activeEnrollments = enrollments.filter(
      (e) => e.status === 'Active' && e.progress < 100
    ).length;

    const completionRate =
      enrollments.length > 0
        ? Math.round((completedEnrollments / enrollments.length) * 100)
        : 72;

    const ratingsSum = courses.reduce((sum, c) => sum + (c.rating || 4.8), 0);
    const averageRating =
      courses.length > 0 ? Number((ratingsSum / courses.length).toFixed(1)) : 4.8;

    return {
      totalInstructors,
      totalLearners,
      activeCourses,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      activeEnrollments,
      completedEnrollments,
      pendingRequests,
      openDisputes,
      unreadNotifications: unreadNotifs,
      annualRevenue,
      monthlyRevenue,
      completionRate,
      averageRating,
      currency: 'USD',
    };
  }

  async getStudentJoinRequests() {
    const learners = await this.learnersRepo.find();
    return learners.filter(
      (l) => l.orgMembershipStatus === 'Pending Organization Approval' || l.requestedOrgName
    );
  }

  async respondStudentJoinRequest(learnerId: string, action: 'approve' | 'reject') {
    const learner = await this.learnersRepo.findById(learnerId);
    if (!learner) {
      throw new NotFoundException(`Learner '${learnerId}' not found`);
    }

    const isApprove = action === 'approve';
    const updated = await this.learnersRepo.update(learnerId, {
      orgMembershipStatus: isApprove ? 'Verified Student' : 'Independent Learner',
      university: isApprove ? (learner.requestedOrgName || 'Stanford University') : 'Independent Learner',
      learnerType: isApprove ? 'Student' : 'Learner',
      status: isApprove ? 'Active Student' : 'Active Learner',
      requestedOrgId: null,
      requestedOrgName: null,
    });

    return updated;
  }
}

