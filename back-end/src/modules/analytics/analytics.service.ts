import {assignedInstructorIds} from '../../common/courses/assignment';
import { Inject, Injectable } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { JsonDatabaseService } from '../../database/json-db.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly db: JsonDatabaseService,
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
    private readonly usersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATION)
    private readonly orgRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.DISPUTES)
    private readonly disputesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.REVIEWS)
    private readonly reviewsRepo: JsonRepository<any>
  ) {}

  async getOverview(organizationId?: string) {
    let [courses, learners, enrollments, transactions, instructors, users] = await Promise.all([
      this.coursesRepo.find(),
      this.learnersRepo.find(),
      this.enrollmentsRepo.find(),
      this.transactionsRepo.find(),
      this.instructorsRepo.find(),
      this.usersRepo.find(),
    ]);

    if (organizationId) {
      courses = courses.filter(c => c.organizationId === organizationId);
      const ids = new Set(courses.map(c => c.id));
      enrollments = enrollments.filter(e => ids.has(e.courseId));
      const learnerIds = new Set(enrollments.map(e => e.learnerId));
      learners = learners.filter(l => learnerIds.has(l.id) || l.organizationId === organizationId);
      transactions = transactions.filter(t => t.organizationId === organizationId || ids.has(t.courseId));
      instructors = instructors.filter(i => i.organizationId === organizationId);
      users = users.filter(u => u.organizationId === organizationId || learners.some(l => l.userId === u.id));
    }
    courses=courses.filter(c=>c.status!=='Archived');
    const paid = transactions.filter(t => t.type==='Payment' && ['completed', 'paid', 'success', 'successful'].includes(String(t.status).toLowerCase()));
    const grossRevenue = paid.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const categoryRevenueMap: Record<string, { count: number; revenue: number; seats: number }> = {};
    for (const c of courses) {
      const cat = c.category || 'General';
      if (!categoryRevenueMap[cat]) {
        categoryRevenueMap[cat] = { count: 0, revenue: 0, seats: 0 };
      }
      categoryRevenueMap[cat].count += 1;
      categoryRevenueMap[cat].revenue += paid.filter(t => t.courseId === c.id || (!t.courseId && (t.courseTitle || t.course) === c.title)).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      categoryRevenueMap[cat].seats += enrollments.filter(e=>e.courseId===c.id).length;
    }

    const categoryBreakdown = Object.entries(categoryRevenueMap).map(([category, stats]) => ({
      category,
      coursesCount: stats.count,
      seatsEnrolled: stats.seats,
      totalRevenue: stats.revenue,
      percentageOfTotal: grossRevenue > 0 ? Math.round((stats.revenue / grossRevenue) * 100) : 0,
    }));

    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const start = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      const inMonth = (value: any) => { const d = new Date(value); return d >= start && d < end; };
      return { name: start.toLocaleString('en-US', { month: 'short' }),
        learners: learners.filter(l => inMonth(l.createdAt)).length,
        revenue: paid.filter(t => inMonth(t.createdAt || t.date)).reduce((sum,t) => sum + (Number(t.amount) || 0), 0) };
    });
    const weeklyActiveUsers = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i);
      const next = new Date(date); next.setDate(next.getDate() + 1);
      return { name: date.toLocaleString('en-US', { weekday: 'short' }), active: users.filter(u => {
        const login = new Date(u.lastLogin); return login >= date && login < next;
      }).length };
    });

    const completed = enrollments.filter((e) => e.status === 'Completed' || e.progress === 100).length;
    const active = enrollments.filter((e) => e.status === 'Active' && e.progress < 100).length;
    const dropped = enrollments.filter((e) => e.status === 'Dropped').length;

    const studentCount = users.filter((u) => u.role === 'Student' || u.role === 'Learner').length;
    const instructorCount = users.filter((u) => u.role === 'Instructor').length;
    const orgCount = users.filter((u) => u.role === 'Organization').length;
    const adminCount = users.filter((u) => u.role === 'Admin' || u.role === 'Super Admin').length;

    const revenueTotals=[...new Set(paid.map(t=>t.currency||null))].map(currency=>({currency,amount:paid.filter(t=>(t.currency||null)===currency).reduce((sum,t)=>sum+(Number(t.amount)||0),0)}));
    const instructorWorkload=instructors.map(i=>{
      const assigned=courses.filter(c=>assignedInstructorIds(c).includes(i.id));
      const rows=enrollments.filter(e=>assigned.some(c=>c.id===e.courseId));
      return {id:i.id,name:i.name,email:i.email,status:i.status,courses:assigned.map(c=>({id:c.id,title:c.title})),assignedCourses:assigned.length,totalEnrollments:rows.length,averageCompletionRate:rows.length?Math.round(rows.filter(e=>String(e.status).toLowerCase()==='completed'||Number(e.progress)>=100).length/rows.length*100):0};
    });
    const reviews=await this.reviewsRepo.find();
    const ratedCourses=courses.map(c=>{const ratings=reviews.filter(r=>r.courseId===c.id&&Number(r.rating)>=1&&Number(r.rating)<=5&&enrollments.some(e=>e.courseId===c.id&&(e.learnerId===r.learnerId||learners.some(l=>l.id===e.learnerId&&l.userId===r.learnerId))));return {id:c.id,title:c.title,status:c.status,reviewCount:ratings.length,rating:ratings.length?Math.round(ratings.reduce((sum,r)=>sum+Number(r.rating),0)/ratings.length*10)/10:null};});
    const topRatedCourses=ratedCourses.some(c=>c.reviewCount)?ratedCourses.filter(c=>c.reviewCount).sort((a,b)=>b.rating-a.rating||b.reviewCount-a.reviewCount):ratedCourses;
    return {
      instructorWorkload,topRatedCourses,
      revenueTotals,
      stats: {
        totalUsers: users.length.toString(),
        totalLearners: studentCount.toString(),
        totalInstructors: instructorCount.toString(),
        organizations: orgCount.toString(),
        adminsCount: adminCount.toString(),
        courses: courses.length.toString(),
        enrollments: enrollments.length.toString(),
        totalRevenue: revenueTotals.length===1?`${revenueTotals[0].currency||'Currency not recorded'} ${revenueTotals[0].amount.toFixed(2)}`:null,
        pendingApprovals: courses.filter((c) => c.status === 'Pending Approval' || c.status === 'Draft').length.toString(),
      },
      userGrowth: monthlyTrend,
      revenueData: monthlyTrend,
      weeklyActiveUsers,
      categoryData: categoryBreakdown.map((c) => ({
        name: c.category,
        value: c.coursesCount,
        count: c.coursesCount,
        revenue: c.totalRevenue,
      })),
      kpis: {
        totalRevenue: grossRevenue,
        monthlyRevenue: monthlyTrend[monthlyTrend.length - 1].revenue,
        totalEnrollments: enrollments.length,
        activeLearners: learners.length,
        completionRate: enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 0,
        retentionRate: enrollments.length ? Math.round((enrollments.length - dropped) / enrollments.length * 100) : 0,
      },
      categoryBreakdown,
      monthlyTrend,
      enrollmentStatusDistribution: { completed, active, dropped },
      learnerDemographics: { students: studentCount, professionals: learners.filter(l => l.learnerType === 'Professional').length },
      topInstructorsByRevenue: instructors
        .sort((a, b) => (b.revenueGenerated || 0) - (a.revenueGenerated || 0))
        .slice(0, 5)
        .map((inst) => ({
          id: inst.id,
          name: inst.name,
          specialization: inst.specialization,
          revenueGenerated: inst.revenueGenerated || 0,
          avgRating: inst.avgRating ?? null,
          enrolledStudents: inst.enrolledStudents || 0,
        })),
    };
  }

  async getSuperAdminAnalytics() {
    const [overview, users, orgs, disputes] = await Promise.all([
      this.getOverview(),
      this.usersRepo.find(),
      this.db.getCollection<any>('organizations'),
      this.disputesRepo.find(),
    ]);

    const activity=await this.db.getCollection<any>('admin_activity');
    return {...overview, rolesBreakdown:{superAdmins:users.filter(u=>String(u.role).toLowerCase().replace(/\s/g,'')==='superadmin').length,admins:users.filter(u=>u.role==='Admin').length,organizations:orgs.length,instructors:users.filter(u=>u.role==='Instructor').length,students:users.filter(u=>['Student','Learner'].includes(u.role)).length},openDisputes:disputes.filter(d=>!['Resolved','Rejected'].includes(d.status)).length,auditLogs:activity.sort((a,b)=>(Date.parse(b.createdAt||b.resolvedAt)||0)-(Date.parse(a.createdAt||a.resolvedAt)||0))};
  }

  async getInstructorAnalytics(instructorId?: string) {
    const [allCourses, allEnrollments, allReviews, allTransactions] = await Promise.all([
      this.coursesRepo.find(),
      this.enrollmentsRepo.find(),
      this.reviewsRepo.find(),
      this.transactionsRepo.find(),
    ]);

    const courses = instructorId
      ? allCourses.filter((c) => {
          const isDirect = c.instructorId === instructorId;
          const isInTeam = (c.instructors || []).some((inst: any) => inst.id === instructorId);
          return isDirect || isInTeam;
        })
      : allCourses;

    const courseIds = courses.map((c) => c.id);

    const enrollments = instructorId
      ? allEnrollments.filter((e) => courseIds.includes(e.courseId))
      : allEnrollments;

    const reviews = instructorId
      ? allReviews.filter((r) => courseIds.includes(r.courseId))
      : allReviews;

    const transactions = instructorId
      ? allTransactions.filter((t) => courseIds.includes(t.courseId) || t.instructorId === instructorId)
      : allTransactions;

    const totalStudents = enrollments.length;
    const activeLearners = enrollments.filter((e) => e.status === 'Active').length;

    // Real average rating computed from reviews
    const validReviews = reviews.filter((r) => r.rating != null && !isNaN(Number(r.rating)));
    const avgRating = validReviews.length > 0
      ? parseFloat((validReviews.reduce((sum, r) => sum + Number(r.rating), 0) / validReviews.length).toFixed(1))
      : null;

    // Real completion rate computed from enrollments
    const completed = enrollments.filter((e) => e.status === 'Completed' || e.progress === 100).length;
    const completionRate = enrollments.length > 0
      ? `${Math.round((completed / enrollments.length) * 100)}%`
      : '0%';

    // Real total earnings from transactions
    const totalEarningsNum = transactions
      .filter((t) => t.type==='Payment' && ['paid','completed','success','successful'].includes(String(t.status).toLowerCase()) && Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const earningPayments=transactions.filter(t=>t.type==='Payment'&&['paid','completed','success','successful'].includes(String(t.status).toLowerCase()));
    const earningCurrencies=[...new Set(earningPayments.map(t=>t.currency||null))];
    const totalEarnings=totalEarningsNum>0&&earningCurrencies.length===1?`${earningCurrencies[0]||'Currency not recorded'} ${totalEarningsNum.toFixed(2)}`:null;

    // Real daily distribution (Mon - Sun) from enrollments
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    enrollments.forEach((e) => {
      const d = e.enrolledAt || e.createdAt;
      if (d) {
        const dayName = dayNames[new Date(d).getDay()];
        if (dayMap[dayName] !== undefined) {
          dayMap[dayName] += 1;
        }
      }
    });
    const dashboardEnrollments = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
      name: day,
      count: dayMap[day],
      enrollments: dayMap[day],
      active: enrollments.filter(e=>e.status==='Active'&&dayNames[new Date(e.enrolledAt||e.createdAt).getDay()]===day).length,
    }));

    // Real enrollment monthly trend
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthMap: Record<string, { enrollments: number; completions: number }> = {};
    monthOrder.forEach((m) => {
      monthMap[m] = { enrollments: 0, completions: 0 };
    });
    enrollments.forEach((e) => {
      const dateStr = e.enrolledAt || e.createdAt;
      if (dateStr) {
        const m = new Date(dateStr).toLocaleString('en', { month: 'short' });
        if (monthMap[m]) {
          monthMap[m].enrollments += 1;
          if (e.status === 'Completed' || e.progress === 100) {
            monthMap[m].completions += 1;
          }
        }
      }
    });
    const currentMonthIdx = new Date().getMonth();
    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      last6Months.push(monthOrder[idx]);
    }
    const enrollmentTrend = last6Months.map((m) => ({
      month: m,
      value: monthMap[m].enrollments,
      enrollments: monthMap[m].enrollments,
      completions: monthMap[m].completions,
    }));

    // Real course performance
    const coursePerformance = courses.slice(0, 5).map((c) => ({
      name: c.title?.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
      students: enrollments.filter(e=>e.courseId===c.id).length,
      rating: reviews.filter(r=>r.courseId===c.id).length?reviews.filter(r=>r.courseId===c.id).reduce((sum,r)=>sum+Number(r.rating||0),0)/reviews.filter(r=>r.courseId===c.id).length:null,
      completionRate: enrollments.some(e=>e.courseId===c.id)?Math.round(enrollments.filter(e=>e.courseId===c.id&&(e.status==='Completed'||e.progress===100)).length/enrollments.filter(e=>e.courseId===c.id).length*100):0,
    }));

    // Real recent activities from enrollments & reviews
    const activities: Array<{ title: string; timestamp: string; ts: number }> = [];
    enrollments.forEach((e) => {
      const dt = e.enrolledAt || e.createdAt;
      activities.push({
        title: `${e.learnerName || 'Student'} enrolled in '${e.courseTitle || 'Course'}'`,
        timestamp: dt ? new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
        ts: dt ? new Date(dt).getTime() : 0,
      });
    });
    reviews.forEach((r) => {
      const dt = r.createdAt;
      activities.push({
        title: `Review received for '${r.courseTitle || 'Course'}': ${r.rating}★`,
        timestamp: dt ? new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
        ts: dt ? new Date(dt).getTime() : 0,
      });
    });
    activities.sort((a, b) => b.ts - a.ts);
    const recentActivity = activities.slice(0, 6).map(({ title, timestamp }) => ({ title, timestamp }));

    return {
      stats: {
        totalCourses: courses.length,
        totalStudents,
        totalEnrollments: totalStudents.toString(),
        activeLearners: activeLearners.toString(),
        averageRating: avgRating,
        completionRate,
        totalEarnings,
        totalReviews: reviews.length,
      },
      dashboardEnrollments,
      enrollmentTrend,
      coursePerformance,
      engagementData: [],
      recentActivity,
    };
  }

  async getRevenueAnalytics() {
    const transactions = await this.transactionsRepo.find();
    const completed=transactions.filter(t=>['completed','paid','success','successful'].includes(String(t.status).toLowerCase()));
    const currencies=[...new Set(completed.map(t=>t.currency||null))];
    return {transactionsLogged:transactions.length,totals:currencies.map(currency=>({currency,received:completed.filter(t=>t.type==='Payment'&&(t.currency||null)===currency).reduce((sum,t)=>sum+Number(t.amount||0),0),paidOut:completed.filter(t=>t.type==='Payout'&&(t.currency||null)===currency).reduce((sum,t)=>sum+Number(t.amount||0),0)}))};
  }
}
