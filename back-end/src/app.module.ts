import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

// ── Route-level middleware ────────────────────────────────────────
import { LoggerMiddleware }       from './common/middleware/logger.middleware';
import { ErrorHandlerMiddleware } from './common/middleware/error-handler.middleware';
import { SecurityMiddleware }     from './common/middleware/security.middleware';
// ─────────────────────────────────────────────────────────────────

import { AuthModule }               from './modules/auth/auth.module';
import { UsersModule }              from './modules/users/users.module';
import { StudentModule }            from './modules/student/student.module';
import { OrganizationModule }       from './modules/organization/organization.module';
import { DashboardModule }          from './modules/dashboard/dashboard.module';
import { InstructorsModule }        from './modules/instructors/instructors.module';
import { InstructorRequestsModule } from './modules/instructor-requests/instructor-requests.module';
import { LearnersModule }           from './modules/learners/learners.module';
import { CoursesModule }            from './modules/courses/courses.module';
import { EnrollmentsModule }        from './modules/enrollments/enrollments.module';
import { AssignmentsModule }        from './modules/assignments/assignments.module';
import { QuizzesModule }            from './modules/quizzes/quizzes.module';
import { CertificatesModule }       from './modules/certificates/certificates.module';
import { PaymentsModule }           from './modules/payments/payments.module';
import { RefundsModule }            from './modules/refunds/refunds.module';
import { ReviewsModule }            from './modules/reviews/reviews.module';
import { DisputesModule }           from './modules/disputes/disputes.module';
import { ReportsModule }            from './modules/reports/reports.module';
import { AnalyticsModule }          from './modules/analytics/analytics.module';
import { NotificationsModule }      from './modules/notifications/notifications.module';
import { SettingsModule }           from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    StudentModule,
    OrganizationModule,
    DashboardModule,
    InstructorsModule,
    InstructorRequestsModule,
    LearnersModule,
    CoursesModule,
    EnrollmentsModule,
    AssignmentsModule,
    QuizzesModule,
    CertificatesModule,
    PaymentsModule,
    RefundsModule,
    ReviewsModule,
    DisputesModule,
    ReportsModule,
    AnalyticsModule,
    NotificationsModule,
    SettingsModule,
  ],
})
export class AppModule implements NestModule {
  /**
   * configure() is the "router-level middleware" hook.
   * Each middleware here runs for EVERY request to /api/*.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        SecurityMiddleware,     // 1. Add security headers first
        LoggerMiddleware,       // 2. Log every request + write to daily log file
        ErrorHandlerMiddleware, // 3. Catch any sync errors and write to errors.log
      )
      .forRoutes('*');          // apply to ALL routes
  }
}
