# NexusPay Enterprise EdTech Platform

> **Consolidated Multi-Actor EdTech Platform** uniting Students / Learners, Instructors / Educators, Organizations, and Platform Administrators into a unified monorepo architecture with an ACID-like persistent JSON Database engine matching all 19 relational entities from the system ER Diagram.

---

## 🏛️ System Architecture Overview

```
edtech-app/
├── backend/                      # Single Unified NestJS 10 REST Backend
│   ├── src/
│   │   ├── common/               # Guards (RolesGuard), Interceptors, Filters, Decorators
│   │   ├── database/             # Persistent JSON DB Engine (schema.ts, json-db.service.ts, json-repository.ts, seeds)
│   │   └── modules/              # 20 Domain Feature Modules
│   │       ├── auth/             # Multi-role authentication & credential management
│   │       ├── users/            # Platform user identity & RBAC
│   │       ├── student/          # Student LMS, enrollments, study plans, checkouts
│   │       ├── organization/     # Organization admin, faculty outreach, institutional telemetry
│   │       ├── instructors/      # Faculty profiles, teaching assignments, reviews
│   │       ├── instructor-requests/ # Faculty outreach requests & approvals
│   │       ├── learners/         # Learner roster & academic metrics
│   │       ├── courses/          # Multi-instructor course tracks, modules & lessons
│   │       ├── enrollments/      # Course enrollments, batch assignments & progress
│   │       ├── quizzes/          # Quizzes, questions pool & automated evaluation
│   │       ├── assignments/      # Practical assignments & submission grading
│   │       ├── certificates/     # Verifiable digital credentials & public ledger
│   │       ├── payments/         # Financial settlements, tuition & royalties
│   │       ├── refunds/          # Refund lifecycle & chargeback controls
│   │       ├── reviews/          # Student reviews & ratings
│   │       ├── disputes/         # Institutional dispute resolution & audits
│   │       ├── reports/          # Executive reporting & CSV exports
│   │       ├── analytics/        # Platform telemetry & KPIs
│   │       ├── notifications/    # Real-time multi-role alerts
│   │       ├── settings/         # Administrative policies & DB backups
│   │       └── dashboard/        # Role dashboards & aggregated statistics
│   └── data/                     # 21 JSON collection files (auto-seeded)
│
└── frontend/                     # Single Unified React 18 + Vite Frontend
    ├── src/
    │   ├── components/
    │   │   ├── common/           # RoleSwitcher, Toast, CertificateModal, Badges, Modals
    │   │   ├── layout/           # Student Navbar, Footer, PageLayout
    │   │   ├── student/          # Student LMS widgets
    │   │   ├── instructor/       # Instructor Studio layouts & UI components
    │   │   ├── organization/     # OrgLayout, OrgSidebar, OrgTopNav
    │   │   └── admin/            # AdminLayout, TopNavbar, Sidebar, StatCards, Charts
    │   ├── pages/
    │   │   ├── Landing.jsx       # Central Role Gateway Hub & quick switcher
    │   │   ├── student/          # 14 Student Pages (Dashboard, Explore, Player, Quiz, Certs, Checkout, etc.)
    │   │   ├── instructor/       # 17 Educator Pages (Auth, Dashboard, Course Authoring, Quizzes, Roster, etc.)
    │   │   ├── organization/     # 20 Org Admin Pages (Dashboard, Faculty, Courses, Payments, Disputes, Reports, etc.)
    │   │   └── admin/            # 24 Admin Pages (Users, Orgs, Verification, Approvals, Disputes, Refunds, etc.)
    │   └── services/
    │       └── api.js            # Unified API client connecting to http://localhost:3000/api
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend API Server

```bash
cd backend
npm install
npm run start:dev
```
- **Backend API**: `http://localhost:3000/api`
- **Interactive Swagger Docs**: `http://localhost:3000/api/docs`
- **Database Storage**: `backend/data/*.json` (21 persistent collections)

### 2. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```
- **Frontend App**: `http://localhost:5173`

---

## 👥 System Actors & Portals

| Actor | Target Portal Route | Core Capabilities |
| :--- | :--- | :--- |
| **Central Hub** | `/` | System overview, interactive role cards, backend health indicator |
| **Student / Learner** | `/student` | Course catalog, learning player, quizzes, certificates, study plans, checkouts |
| **Instructor / Educator** | `/instructor` | Course curriculum builder, module/lesson authoring, quiz pools, student progress |
| **Organization Admin** | `/org` | Faculty directory, teaching requests, multi-instructor courses, dispute raising, revenue ledgers |
| **Platform Super Admin** | `/admin` | User management, institution verification, course approval queue, refunds, disputes |

---

## 📊 19 ER Entities Modeled

All entities from the platform ER Diagram are fully typed and persisted:
1. `User` (Identity, credentials, roles, status)
2. `Learner` (Academic level, progress, enrolled courses)
3. `Student` (Institutional student roster)
4. `University` (Accredited universities & colleges)
5. `Educator` (Faculty expertise, bio, ratings, royalties)
6. `Organization` (Enterprise academies, accreditation)
7. `Course` (Curriculum, pricing, multi-instructors, level)
8. `Module` (Sequential chapters within a course)
9. `Lesson` (Video player URLs, transcripts, durations)
10. `Enrollment` (Student-course progression & completed lessons)
11. `Assignment` (Practical exercises & rubric)
12. `Submission` (Student work, grades & feedback)
13. `Certificate` (Verified credentials, certificates with verification IDs)
14. `Payment` / `Transaction` (Tuition charges, 70/30 faculty royalty split)
15. `Review` (Student star ratings & comments)
16. `Quiz` (Course assessments, duration, passing score)
17. `Quiz_Question` (Multiple choice questions & answer keys)
18. `Admin` (Super admin credentials & audit access)
19. `Dispute` (Institutional dispute tickets, priority escalation, and resolution workflow)
