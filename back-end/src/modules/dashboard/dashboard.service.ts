import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class DashboardService {
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
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS)
    private readonly transactionsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTOR_REQUESTS)
    private readonly requestsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>
  ) {}

  async getOverview() {
    const [
      org,
      instructorsCount,
      learnersCount,
      courses,
      enrollments,
      transactions,
      pendingRequests,
      recentNotifications,
    ] = await Promise.all([
      this.orgRepo.find(),
      this.instructorsRepo.count(),
      this.learnersRepo.count(),
      this.coursesRepo.find(),
      this.enrollmentsRepo.find({ limit: 10, sort: { createdAt: 'desc' } }),
      this.transactionsRepo.find({ limit: 8, sort: { createdAt: 'desc' } }),
      this.requestsRepo.find({
        where: { status: { $regex: /pending|sent/i } },
        limit: 5,
      }),
      this.notifsRepo.find({ limit: 5, sort: { createdAt: 'desc' } }),
    ]);

    const activeCourses = courses.filter((c) => c.status === 'Published').length;
    const annualRevenue = courses.reduce(
      (sum, c) => sum + (c.revenue || c.price * (c.enrolledCount || 10)),
      0
    );
    const monthlyRevenue = Math.round(annualRevenue * 0.3);

    const organizationInfo = org[0] || {
      name: 'NexusPay Enterprise Academy',
      tagline: 'Empowering Financial Engineering Leaders',
      email: 'admin@nexuspay.edu',
    };

    return {
      organization: organizationInfo,
      kpis: {
        totalInstructors: instructorsCount,
        totalLearners: learnersCount,
        activeCourses,
        totalEnrollments: (await this.enrollmentsRepo.count()),
        annualRevenue,
        monthlyRevenue,
        pendingRequestsCount: pendingRequests.length,
        averageRating: 4.8,
        completionRate: 72,
      },
      recentEnrollments: enrollments,
      recentTransactions: transactions,
      pendingInvitations: pendingRequests,
      recentNotifications,
      topPerformingCourses: courses.slice(0, 4).map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        enrolledCount: c.enrolledCount || 0,
        rating: c.rating || 4.8,
        revenue: c.revenue || c.price * (c.enrolledCount || 0),
        status: c.status,
      })),
    };
  }

  async getRecentActivity() {
    const [enrollments, transactions, notifications, requests] = await Promise.all([
      this.enrollmentsRepo.find({ limit: 5, sort: { createdAt: 'desc' } }),
      this.transactionsRepo.find({ limit: 5, sort: { createdAt: 'desc' } }),
      this.notifsRepo.find({ limit: 5, sort: { createdAt: 'desc' } }),
      this.requestsRepo.find({ limit: 5, sort: { createdAt: 'desc' } }),
    ]);

    return {
      enrollments,
      transactions,
      notifications,
      requests,
    };
  }
}
