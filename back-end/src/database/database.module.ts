import { Global, Module } from '@nestjs/common';
import { JsonDatabaseService } from './json-db.service';
import { JsonRepository } from './json-repository';

export const REPOSITORY_TOKENS = {
  USERS: 'USERS_REPOSITORY',
  ORGANIZATION: 'ORGANIZATION_REPOSITORY',
  ORGANIZATIONS: 'ORGANIZATION_REPOSITORY',
  UNIVERSITIES: 'UNIVERSITIES_REPOSITORY',
  INSTRUCTORS: 'INSTRUCTORS_REPOSITORY',
  INSTRUCTOR_REQUESTS: 'INSTRUCTOR_REQUESTS_REPOSITORY',
  LEARNERS: 'LEARNERS_REPOSITORY',
  STUDENTS: 'STUDENTS_REPOSITORY',
  ADMINS: 'ADMINS_REPOSITORY',
  COURSES: 'COURSES_REPOSITORY',
  MODULES: 'MODULES_REPOSITORY',
  LESSONS: 'LESSONS_REPOSITORY',
  ENROLLMENTS: 'ENROLLMENTS_REPOSITORY',
  ASSIGNMENTS: 'ASSIGNMENTS_REPOSITORY',
  SUBMISSIONS: 'SUBMISSIONS_REPOSITORY',
  QUIZZES: 'QUIZZES_REPOSITORY',
  QUIZ_QUESTIONS: 'QUIZ_QUESTIONS_REPOSITORY',
  CERTIFICATES: 'CERTIFICATES_REPOSITORY',
  TRANSACTIONS: 'TRANSACTIONS_REPOSITORY',
  PAYMENTS: 'TRANSACTIONS_REPOSITORY',
  REFUNDS: 'REFUNDS_REPOSITORY',
  REVIEWS: 'REVIEWS_REPOSITORY',
  DISPUTES: 'DISPUTES_REPOSITORY',
  REPORTS: 'REPORTS_REPOSITORY',
  NOTIFICATIONS: 'NOTIFICATIONS_REPOSITORY',
  SETTINGS: 'SETTINGS_REPOSITORY',
};

const repositoryProviders = [
  {
    provide: REPOSITORY_TOKENS.USERS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('users', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.ORGANIZATION,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('organizations', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.UNIVERSITIES,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('universities', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.INSTRUCTORS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('instructors', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.INSTRUCTOR_REQUESTS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('instructor_requests', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.LEARNERS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('learners', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.STUDENTS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('students', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.ADMINS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('admins', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.COURSES,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('courses', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.MODULES,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('modules', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.LESSONS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('lessons', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.ENROLLMENTS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('enrollments', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.ASSIGNMENTS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('assignments', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.SUBMISSIONS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('submissions', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.QUIZZES,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('quizzes', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.QUIZ_QUESTIONS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('quiz_questions', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.CERTIFICATES,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('certificates', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.TRANSACTIONS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('transactions', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.REFUNDS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('refunds', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.REVIEWS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('reviews', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.DISPUTES,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('disputes', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.REPORTS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('reports', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.NOTIFICATIONS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('notifications', db),
    inject: [JsonDatabaseService],
  },
  {
    provide: REPOSITORY_TOKENS.SETTINGS,
    useFactory: (db: JsonDatabaseService) => new JsonRepository('settings', db),
    inject: [JsonDatabaseService],
  },
];

@Global()
@Module({
  providers: [JsonDatabaseService, ...repositoryProviders],
  exports: [JsonDatabaseService, ...repositoryProviders],
})
export class DatabaseModule {}
