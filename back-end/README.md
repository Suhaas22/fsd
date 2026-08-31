# NexusPay Enterprise Academy - NestJS Backend

A complete, production-grade backend for the Organization Management platform built with **NestJS**, **TypeScript**, and a high-performance **JSON Database Simulation Engine** simulating ACID-like database behaviour without external database server dependencies.

---

## 🏛 Architecture & Key Features

- **JSON Database Simulation Engine (`JsonDatabaseService` & `JsonRepository<T>`)**:
  - Thread-safe file persistence in `./data/*.json`.
  - Atomic write operations (temporary file + atomic rename) with mutex lock queues.
  - In-memory data store for microsecond latencies.
  - Automatic seed initialization when collections are missing or empty.
  - Multi-collection atomic transactions (`runTransaction`) with automated rollback.
  - Advanced querying with operators: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$regex`, `$contains`, `$exists`, `$or`, `$and`.
  - Multi-field sorting and pagination meta calculation.

- **13 Feature Modules**:
  1. **Organization Profile (`/api/organization`)**: Manage institutional profile, branding, and dynamic KPIs.
  2. **Dashboard Telemetry (`/api/dashboard`)**: Aggregated metrics, recent enrollments, transactions, and live activity feeds.
  3. **Instructors (`/api/instructors`)**: Faculty CRUD, specialization search, rating telemetry, and course associations.
  4. **Instructor Requests (`/api/instructor-requests`)**: Formal teaching assignments, outreach emails, accept/decline responses (with automated course instructor roster updates & college notifications).
  5. **Learners (`/api/learners`)**: Student and corporate professional cohorts directory, progress scores, certificates.
  6. **Courses Catalog (`/api/courses`)**: Multi-instructor teams (Lead + Co-Instructors), syllabus modules & lessons, pricing, status.
  7. **Enrollments & Course Assignment (`/api/enrollments`)**: Progress updates (0-100%) and atomic batch course assignment with automated billing transaction generation.
  8. **Payments & Ledger (`/api/payments`)**: Financial transactions (Payments, Payouts, Refunds), revenue summaries, and downloadable receipts.
  9. **Disputes & Governance (`/api/disputes`)**: ER Diagram Dispute entity tracking (`Open`, `Under Review`, `Escalated`, `Resolved`), priority levels, audit notes, resolution logs.
  10. **Reports & Exports (`/api/reports`)**: Dynamic generation and real-time CSV/JSON export of Enrollment, Financial, Performance, and Audit reports.
  11. **Analytics & Telemetry (`/api/analytics`)**: Category revenue distribution, retention metrics, completion statistics.
  12. **Notifications (`/api/notifications`)**: Event-driven alerts, category filters, unread badge counters, mark-as-read.
  13. **Settings & Governance (`/api/settings`)**: Organization preferences, database snapshots, and one-click database reset.

- **Global Standard Layers**:
  - Global `ValidationPipe` with `class-validator` / `class-transformer`.
  - Global `HttpExceptionFilter` producing uniform structured error JSON.
  - Global `TransformResponseInterceptor` ensuring `{ success: true, data: ..., timestamp: ... }`.
  - Global `LoggingInterceptor` for HTTP telemetry.
  - Interactive **Swagger / OpenAPI 3.0** documentation at `/api/docs`.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22.18.0)
- **npm**: v9+ (tested on npm 10.9.3)

### 2. Installation
```bash
cd d:/edtech-app/edtech_app
npm install
```

### 3. Run Development Server
```bash
npm run start:dev
```

### 4. Build and Run Production
```bash
npm run build
npm run start:prod
```

The server will be available at:
- **REST API Base URL**: `http://localhost:3000/api`
- **Interactive Swagger UI**: `http://localhost:3000/api/docs`

---

## 🧪 Running Automated Tests

```bash
# Run unit and integration tests
npm test

# Run tests with coverage
npm run test:cov
```

---

## 📂 Persistent Data Directory

All JSON database collections are stored in `./data/`:
- `organizations.json`
- `instructors.json`
- `instructor_requests.json`
- `learners.json`
- `courses.json`
- `enrollments.json`
- `transactions.json`
- `disputes.json`
- `reports.json`
- `notifications.json`
- `settings.json`
