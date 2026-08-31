import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Filters & Interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor()
  );

  // Global Roles Guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesGuard(reflector));

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger Documentation Setup
  const swaggerPath = process.env.SWAGGER_PATH || 'api/docs';
  const config = new DocumentBuilder()
    .setTitle('NexusPay Enterprise EdTech Platform API')
    .setDescription(
      'Consolidated Unified Backend API supporting all 4 system actors: Students / Learners, Instructors / Educators, Organizations, and Platform Administrators with persistent JSON Database engine matching 19 relational entities from the ER Diagram.'
    )
    .setVersion('2.0.0')
    .addTag('Authentication & Identity', 'Sign in, registration, session management, and credential updates')
    .addTag('Student & Learner LMS', 'Student academic profile, enrollments, study plans, and checkout')
    .addTag('Instructors', 'Faculty management, educator profiles, ratings, and teaching assignments')
    .addTag('Instructor Requests', 'Faculty outreach requests, invitation tracking, and approvals')
    .addTag('Organization', 'Organization profile, institutional metrics, and entity verification')
    .addTag('Organizations - Directory & Governance', 'Accredited universities and enterprise organizations directory')
    .addTag('Courses', 'Course catalog, modules, lessons, and multi-instructor curriculum authoring')
    .addTag('Enrollments', 'Course enrollments, batch assignments, and learner progression')
    .addTag('Quizzes & Academic Assessments', 'Assessment authoring, question pools, and student evaluations')
    .addTag('Assignments & Practical Submissions', 'Practical assignments, code submissions, and grading')
    .addTag('Certificates & Verified Credentials', 'Verifiable credential issuance, digital certificates, and verification')
    .addTag('Payments & Transactions', 'Financial revenue settlement, tuition checkouts, and royalty splits')
    .addTag('Platform Admin - User Management', 'Platform user directory and administrative lifecycle controls')
    .addTag('Platform Admin - Refunds & Chargebacks', 'Tuition refund processing and chargeback administration')
    .addTag('Disputes & Governance', 'Institutional dispute tickets, priority escalation, and resolutions')
    .addTag('Reviews & Course Ratings', 'Student course reviews, star ratings, and educator feedback')
    .addTag('Analytics & Telemetry', 'Comprehensive learning and financial telemetry')
    .addTag('Reports & Exports', 'Executive and academic report generation and CSV exports')
    .addTag('Notifications', 'Real-time multi-role alerts and event notifications')
    .addTag('Settings & Database Governance', 'Administrative configuration and database state management')
    .addApiKey({ type: 'apiKey', name: 'x-role', in: 'header' }, 'x-role')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    customSiteTitle: 'NexusPay EdTech API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`===========================================================`);
  logger.log(`🚀 Unified NestJS Backend running at: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger API Documentation:         http://localhost:${port}/${swaggerPath}`);
  logger.log(`💾 JSON Database Directory:           ${process.env.DATA_DIR || './data'}`);
  logger.log(`===========================================================`);
}

bootstrap();
