import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────
// 0. LANDING & GATEWAY
// ──────────────────────────────────────────────────────────────
import Landing from './pages/Landing';

// ──────────────────────────────────────────────────────────────
// 1. STUDENT / LEARNER PAGES
// ──────────────────────────────────────────────────────────────
import StudentDashboard from './pages/student/Dashboard';
import StudentExplore from './pages/student/ExploreCourses';
import ExploreCoursesAssign from './pages/student/App_S20240010035';
import QuizAssign from './pages/student/App_S20240010198';
import StudentStudyPlan from './pages/student/App_S20240010200';
import StudentCourseDetails from './pages/student/CourseDetails';
import StudentCheckout from './pages/student/Checkout';
import StudentPaymentSuccess from './pages/student/PaymentSuccess';
import StudentMyLearning from './pages/student/MyLearning';
import StudentCourseProgress from './pages/student/CourseProgress';
import StudentLearningPlayer from './pages/student/LearningPlayer';
import StudentQuiz from './pages/student/Quiz';
import StudentCertificates from './pages/student/Certificates';
import StudentProfile from './pages/student/Profile';

// ──────────────────────────────────────────────────────────────
// 2. INSTRUCTOR / EDUCATOR PAGES & LAYOUTS
// ──────────────────────────────────────────────────────────────
import { AuthLayout } from './components/instructor/layouts/AuthLayout';
import { InstructorLayout } from './components/instructor/layouts/InstructorLayout';
import { Login as InstructorLogin } from './pages/instructor/auth/Login';
import { Register as InstructorRegister } from './pages/instructor/auth/Register';
import { Dashboard as InstructorDashboard } from './pages/instructor/instructor/Dashboard';
import { Profile as InstructorProfile } from './pages/instructor/instructor/Profile';
import { MyCourses } from './pages/instructor/courses/MyCourses';
import { CreateCourse as InstructorCreateCourse } from './pages/instructor/courses/CreateCourse';
import { EditCourse as InstructorEditCourse } from './pages/instructor/courses/EditCourse';
import { CourseContent as InstructorCourseContent } from './pages/instructor/courses/CourseContent';
import { CreateModule } from './pages/instructor/courses/CreateModule';
import { CreateLesson } from './pages/instructor/courses/CreateLesson';
import { CreateQuiz as InstructorCreateQuiz } from './pages/instructor/courses/CreateQuiz';
import { Students as InstructorStudents } from './pages/instructor/students/Students';
import { StudentProgress } from './pages/instructor/students/StudentProgress';
import { Reviews as InstructorReviews } from './pages/instructor/insights/Reviews';
import { Analytics as InstructorAnalytics } from './pages/instructor/insights/Analytics';
import { Notifications as InstructorNotifications } from './pages/instructor/insights/Notifications';
import { Settings as InstructorSettings } from './pages/instructor/insights/Settings';

// ──────────────────────────────────────────────────────────────
// 3. ORGANIZATION ADMIN PAGES
// ──────────────────────────────────────────────────────────────
import OrgDashboard from './pages/organization/Dashboard';
import OrgProfile from './pages/organization/Profile';
import OrgInstructorRequests from './pages/organization/InstructorRequests';
import OrgInstructorRequestDetails from './pages/organization/InstructorRequestDetails';
import OrgInstructors from './pages/organization/Instructors';
import OrgInstructorDetails from './pages/organization/InstructorDetails';
import OrgLearners from './pages/organization/Learners';
import OrgLearnerDetails from './pages/organization/LearnerDetails';
import OrgCourses from './pages/organization/Courses';
import OrgCourseDetails from './pages/organization/CourseDetails';
import OrgCreateCourse from './pages/organization/CreateCourse';
import OrgEditCourse from './pages/organization/EditCourse';
import OrgEnrollments from './pages/organization/Enrollments';
import OrgAssignCourses from './pages/organization/AssignCourses';
import OrgPayments from './pages/organization/Payments';
import OrgDisputes from './pages/organization/Disputes';
import OrgReports from './pages/organization/Reports';
import OrgAnalytics from './pages/organization/Analytics';
import OrgNotifications from './pages/organization/Notifications';
import OrgSettings from './pages/organization/Settings';

// ──────────────────────────────────────────────────────────────
// 4. PLATFORM ADMIN PAGES & LAYOUT
// ──────────────────────────────────────────────────────────────
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { Users as AdminUsers } from './pages/admin/Users';
import { UserDetails as AdminUserDetails } from './pages/admin/UserDetails';
import { Learners as AdminLearners } from './pages/admin/Learners';
import { LearnerDetails as AdminLearnerDetails } from './pages/admin/LearnerDetails';
import { Instructors as AdminInstructors } from './pages/admin/Instructors';
import { InstructorDetails as AdminInstructorDetails } from './pages/admin/InstructorDetails';
import { Organizations as AdminOrganizations } from './pages/admin/Organizations';
import { OrganizationDetails as AdminOrganizationDetails } from './pages/admin/OrganizationDetails';
import { OrganizationVerification as AdminOrgVerification } from './pages/admin/OrganizationVerification';
import { Courses as AdminCourses } from './pages/admin/Courses';
import { CourseDetails as AdminCourseDetails } from './pages/admin/CourseDetails';
import { CourseApproval as AdminCourseApproval } from './pages/admin/CourseApproval';
import { Enrollments as AdminEnrollments } from './pages/admin/Enrollments';
import { Payments as AdminPayments } from './pages/admin/Payments';
import { Transactions as AdminTransactions } from './pages/admin/Transactions';
import { Refunds as AdminRefunds } from './pages/admin/Refunds';
import { Certificates as AdminCertificates } from './pages/admin/Certificates';
import { Disputes as AdminDisputes } from './pages/admin/Disputes';
import { Analytics as AdminAnalytics } from './pages/admin/Analytics';
import { Reports as AdminReports } from './pages/admin/Reports';
import { Notifications as AdminNotifications } from './pages/admin/Notifications';
import { Profile as AdminProfile } from './pages/admin/Profile';
import { Settings as AdminSettings } from './pages/admin/Settings';

export default function App() {
  return (
    <Routes>
      {/* ────────────────────────────────────────────────────────────── */}
      {/* 0. CENTRAL LANDING GATEWAY */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route path="/" element={<Landing />} />

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 1. STUDENT / LEARNER ROUTES */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/explore" element={<StudentExplore />} />
      <Route path="/student/explore-assignment" element={<ExploreCoursesAssign />} />
      <Route path="/student/quiz-assignment" element={<QuizAssign />} />
      <Route path="/student/study-plan" element={<StudentStudyPlan />} />
      <Route path="/student/course/:id" element={<StudentCourseDetails />} />
      <Route path="/student/course-details" element={<StudentCourseDetails />} />
      <Route path="/student/checkout" element={<StudentCheckout />} />
      <Route path="/student/payment-success" element={<StudentPaymentSuccess />} />
      <Route path="/student/my-learning" element={<StudentMyLearning />} />
      <Route path="/student/course-progress" element={<StudentCourseProgress />} />
      <Route path="/student/player" element={<StudentLearningPlayer />} />
      <Route path="/student/quiz" element={<StudentQuiz />} />
      <Route path="/student/certificates" element={<StudentCertificates />} />
      <Route path="/student/profile" element={<StudentProfile />} />

      {/* Student Direct Fallback Aliases */}
      <Route path="/explore" element={<StudentExplore />} />
      <Route path="/my-learning" element={<StudentMyLearning />} />
      <Route path="/player" element={<StudentLearningPlayer />} />
      <Route path="/checkout" element={<StudentCheckout />} />

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2. INSTRUCTOR / EDUCATOR ROUTES */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/instructor/login" element={<InstructorLogin />} />
        <Route path="/instructor/register" element={<InstructorRegister />} />
      </Route>

      <Route path="/instructor" element={<InstructorLayout />}>
        <Route index element={<InstructorDashboard />} />
        <Route path="dashboard" element={<InstructorDashboard />} />
        <Route path="profile" element={<InstructorProfile />} />

        {/* Courses */}
        <Route path="courses" element={<MyCourses />} />
        <Route path="courses/create" element={<InstructorCreateCourse />} />
        <Route path="courses/:id/edit" element={<InstructorEditCourse />} />
        <Route path="courses/:id/content" element={<InstructorCourseContent />} />
        <Route path="courses/module/create" element={<CreateModule />} />
        <Route path="courses/module/:id/edit" element={<CreateModule />} />
        <Route path="courses/lesson/create" element={<CreateLesson />} />
        <Route path="courses/lesson/:id/edit" element={<CreateLesson />} />
        <Route path="courses/quiz/create" element={<InstructorCreateQuiz />} />
        <Route path="courses/quiz/:id/edit" element={<InstructorCreateQuiz />} />

        {/* Students */}
        <Route path="students" element={<InstructorStudents />} />
        <Route path="students/:id" element={<StudentProgress />} />

        {/* Insights & Settings */}
        <Route path="reviews" element={<InstructorReviews />} />
        <Route path="analytics" element={<InstructorAnalytics />} />
        <Route path="notifications" element={<InstructorNotifications />} />
        <Route path="settings" element={<InstructorSettings />} />
      </Route>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 3. ORGANIZATION ADMIN ROUTES */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route path="/org" element={<OrgDashboard />} />
      <Route path="/org/dashboard" element={<OrgDashboard />} />
      <Route path="/organization" element={<OrgDashboard />} />
      <Route path="/organization/dashboard" element={<OrgDashboard />} />

      <Route path="/org/profile" element={<OrgProfile />} />
      <Route path="/organization/profile" element={<OrgProfile />} />

      <Route path="/org/instructor-requests" element={<OrgInstructorRequests />} />
      <Route path="/org/instructor-requests/:id" element={<OrgInstructorRequestDetails />} />
      <Route path="/organization/instructor-requests" element={<OrgInstructorRequests />} />

      <Route path="/org/instructors" element={<OrgInstructors />} />
      <Route path="/org/instructors/:id" element={<OrgInstructorDetails />} />
      <Route path="/organization/instructors" element={<OrgInstructors />} />

      <Route path="/org/learners" element={<OrgLearners />} />
      <Route path="/org/learners/:id" element={<OrgLearnerDetails />} />
      <Route path="/organization/learners" element={<OrgLearners />} />

      <Route path="/org/courses" element={<OrgCourses />} />
      <Route path="/org/courses/create" element={<OrgCreateCourse />} />
      <Route path="/org/courses/:id" element={<OrgCourseDetails />} />
      <Route path="/org/courses/:id/edit" element={<OrgEditCourse />} />
      <Route path="/organization/courses" element={<OrgCourses />} />

      <Route path="/org/enrollments" element={<OrgEnrollments />} />
      <Route path="/org/assign-courses" element={<OrgAssignCourses />} />
      <Route path="/organization/enrollments" element={<OrgEnrollments />} />
      <Route path="/organization/assign-courses" element={<OrgAssignCourses />} />

      <Route path="/org/payments" element={<OrgPayments />} />
      <Route path="/org/transactions" element={<Navigate to="/org/payments" replace />} />
      <Route path="/organization/payments" element={<OrgPayments />} />

      <Route path="/org/disputes" element={<OrgDisputes />} />
      <Route path="/org/raise-dispute" element={<OrgDisputes />} />
      <Route path="/organization/disputes" element={<OrgDisputes />} />

      <Route path="/org/reports" element={<OrgReports />} />
      <Route path="/org/analytics" element={<OrgAnalytics />} />
      <Route path="/org/notifications" element={<OrgNotifications />} />
      <Route path="/org/settings" element={<OrgSettings />} />

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 4. PLATFORM ADMIN ROUTES */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:userId" element={<AdminUserDetails />} />

        <Route path="learners" element={<AdminLearners />} />
        <Route path="learners/:learnerId" element={<AdminLearnerDetails />} />

        <Route path="instructors" element={<AdminInstructors />} />
        <Route path="instructors/:instructorId" element={<AdminInstructorDetails />} />

        <Route path="organizations" element={<AdminOrganizations />} />
        <Route path="organizations/:organizationId" element={<AdminOrganizationDetails />} />
        <Route path="organizations/verification" element={<AdminOrgVerification />} />

        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/:courseId" element={<AdminCourseDetails />} />
        <Route path="courses/approval" element={<AdminCourseApproval />} />

        <Route path="enrollments" element={<AdminEnrollments />} />
        <Route path="disputes" element={<AdminDisputes />} />

        <Route path="payments" element={<AdminPayments />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="refunds" element={<AdminRefunds />} />

        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<AdminNotifications />} />

        <Route path="profile" element={<AdminProfile />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
