import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS)
    private readonly transactionsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepo: JsonRepository<any>
  ) {}

  async getOverview() {
    const [courses, learners, enrollments, transactions, instructors, users] = await Promise.all([
      this.coursesRepo.find(),
      this.learnersRepo.find(),
      this.enrollmentsRepo.find(),
      this.transactionsRepo.find(),
      this.instructorsRepo.find(),
      this.usersRepo.find(),
    ]);

    const grossRevenue = courses.reduce(
      (sum, c) => sum + (c.revenue || (c.price || 0) * (c.enrolledCount || 10)),
      0
    );

    const categoryRevenueMap: Record<string, { count: number; revenue: number; seats: number }> = {};
    for (const c of courses) {
      const cat = c.category || 'General';
      if (!categoryRevenueMap[cat]) {
        categoryRevenueMap[cat] = { count: 0, revenue: 0, seats: 0 };
      }
      categoryRevenueMap[cat].count += 1;
      categoryRevenueMap[cat].revenue += c.revenue || (c.price || 0) * (c.enrolledCount || 10);
      categoryRevenueMap[cat].seats += c.enrolledCount || 0;
    }

    const categoryBreakdown = Object.entries(categoryRevenueMap).map(([category, stats]) => ({
      category,
      coursesCount: stats.count,
      seatsEnrolled: stats.seats,
      totalRevenue: stats.revenue,
      percentageOfTotal: grossRevenue > 0 ? Math.round((stats.revenue / grossRevenue) * 100) : 0,
    }));

    const monthlyTrend = [
      { name: 'May', learners: 340, revenue: 24800 },
      { name: 'Jun', learners: 410, revenue: 28900 },
      { name: 'Jul', learners: 520, revenue: 35400 },
      { name: 'Aug', learners: 680, revenue: 42580 },
    ];

    const completed = enrollments.filter((e) => e.status === 'Completed' || e.progress === 100).length;
    const active = enrollments.filter((e) => e.status === 'Active' && e.progress < 100).length;
    const dropped = enrollments.filter((e) => e.status === 'Dropped').length;

    const studentCount = users.filter((u) => u.role === 'Student' || u.role === 'Learner').length;
    const instructorCount = users.filter((u) => u.role === 'Instructor').length;
    const orgCount = users.filter((u) => u.role === 'Organization').length;
    const adminCount = users.filter((u) => u.role === 'Admin' || u.role === 'Super Admin').length;

    return {
      stats: {
        totalUsers: users.length.toString(),
        totalLearners: studentCount.toString(),
        totalInstructors: instructorCount.toString(),
        organizations: orgCount.toString(),
        adminsCount: adminCount.toString(),
        courses: courses.length.toString(),
        enrollments: enrollments.length.toString(),
        totalRevenue: `$${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        pendingApprovals: courses.filter((c) => c.status === 'Pending Approval' || c.status === 'Draft').length.toString(),
      },
      userGrowth: monthlyTrend,
      revenueData: monthlyTrend,
      kpis: {
        totalRevenue: grossRevenue,
        monthlyRevenue: Math.round(grossRevenue * 0.3),
        totalEnrollments: enrollments.length,
        activeLearners: learners.length,
        completionRate: enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 72,
        retentionRate: 94.2,
      },
      categoryBreakdown,
      monthlyTrend,
      enrollmentStatusDistribution: { completed, active, dropped },
      learnerDemographics: { students: studentCount, professionals: learners.length - studentCount },
      topInstructorsByRevenue: instructors
        .sort((a, b) => (b.revenueGenerated || 0) - (a.revenueGenerated || 0))
        .slice(0, 5)
        .map((inst) => ({
          id: inst.id,
          name: inst.name,
          specialization: inst.specialization,
          revenueGenerated: inst.revenueGenerated || 0,
          avgRating: inst.avgRating || 4.8,
          enrolledStudents: inst.enrolledStudents || 0,
        })),
    };
  }

  async getSuperAdminAnalytics() {
    const overview = await this.getOverview();
    const users = await this.usersRepo.find();
    return {
      ...overview,
      systemHealth: { status: 'Optimal', uptime: '99.98%', activeDatabase: 'JSON DB Simulation Engine', version: '2.4.0' },
      rolesBreakdown: {
        superAdmins: users.filter((u) => u.role === 'Super Admin').length,
        admins: users.filter((u) => u.role === 'Admin').length,
        organizations: users.filter((u) => u.role === 'Organization').length,
        instructors: users.filter((u) => u.role === 'Instructor').length,
        students: users.filter((u) => u.role === 'Student' || u.role === 'Learner').length,
      },
      auditLogs: [
        { id: 'log-1', action: 'Global system backup', user: 'Platform Super Admin', timestamp: '10 mins ago', status: 'Success' },
        { id: 'log-2', action: 'New Admin role assigned', user: 'Platform Super Admin', timestamp: '1 hour ago', status: 'Success' },
        { id: 'log-3', action: 'Organization verification approved', user: 'Operational Admin', timestamp: '3 hours ago', status: 'Success' },
      ]
    };
  }

  async getInstructorAnalytics() {
    const courses = await this.coursesRepo.find();
    const enrollments = await this.enrollmentsRepo.find();

    return {
      stats: {
        totalCourses: courses.length,
        totalStudents: enrollments.length || 342,
        averageRating: 4.8,
        completionRate: '78%',
        totalEarnings: '$28,400.00',
      },
      dashboardEnrollments: [
        { name: 'Mon', count: 12 },
        { name: 'Tue', count: 19 },
        { name: 'Wed', count: 15 },
        { name: 'Thu', count: 22 },
        { name: 'Fri', count: 28 },
        { name: 'Sat', count: 18 },
        { name: 'Sun', count: 24 },
      ],
      recentActivity: [
        { title: "New student enrolled in 'Theory of Computation'", timestamp: "1 hour ago" },
        { title: "Course 'Advanced Enterprise Architecture' received 5-star review", timestamp: "3 hours ago" },
        { title: "Quiz submission graded for Alex Chen (95%)", timestamp: "1 day ago" },
      ],
    };
  }

  async getRevenueAnalytics() {
    const transactions = await this.transactionsRepo.find();
    return {
      monthlyRunRate: 42580,
      annualProjection: 142580 * 1.25,
      royaltyPayoutRatio: '70/30',
      payoutLiability: 3200.0,
      transactionsLogged: transactions.length,
    };
  }
}
