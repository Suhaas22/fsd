import LogDetails from './components/workspace/LogDetails';
import Logs from './components/workspace/Logs';
import StudentPageLayout from './components/layout/PageLayout';
import NotificationsPage from './components/workspace/NotificationsPage';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────
// 0. LANDING & GATEWAY
// ──────────────────────────────────────────────────────────────
import Landing from './pages/Landing';
import VerifyCertificate from './pages/VerifyCertificate';
import UnavailablePage from './pages/UnavailablePage';
import SignIn from './pages/Signin';
import SignUp from './pages/Signup';
import ForgotPassword from './pages/Forgot_Password';

// ──────────────────────────────────────────────────────────────
// 1. STUDENT / LEARNER PAGES
// ──────────────────────────────────────────────────────────────
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentExplore = lazy(() => import('./pages/student/ExploreCourses'));
const StudentCourseDetails = lazy(() => import('./pages/student/CourseDetails'));
const StudentCheckout = lazy(() => import('./pages/student/Checkout'));
const StudentPaymentSuccess = lazy(() => import('./pages/student/PaymentSuccess'));
const StudentMyLearning = lazy(() => import('./pages/student/MyLearning'));
const StudentLearningPlayer = lazy(() => import('./pages/student/LearningPlayer'));
const StudentQuiz = lazy(() => import('./pages/student/Quiz'));
const StudentCertificates = lazy(() => import('./pages/student/Certificates'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const StudentPaymentReceipt = lazy(() => import('./pages/student/PaymentReceipt'));
const StudentSupportRequest = lazy(() => import('./pages/student/SupportRequest'));
const StudentSupportDetails = lazy(() => import('./pages/student/SupportDetails'));
const StudentBilling = lazy(() => import('./pages/student/Billing'));
const StudentReviews = lazy(() => import('./pages/student/Reviews'));
const StudentDisputes = lazy(() => import('./pages/student/Disputes'));
import StudentRouteMiddleware from './components/student/layout/StudentRouteMiddleware';
import RoleGuard from './components/auth/RoleGuard';

// ──────────────────────────────────────────────────────────────
// 2. INSTRUCTOR / EDUCATOR PAGES & LAYOUTS
// ──────────────────────────────────────────────────────────────
import { InstructorLayout } from './components/instructor/layouts/InstructorLayout';
import { InstructorProvider } from './context/InstructorContext';
const InstructorDashboard = lazy(() => import('./pages/instructor/instructor/Dashboard').then(module => ({ default: module.Dashboard })));
const InstructorProfile = lazy(() => import('./pages/instructor/instructor/Profile').then(module => ({ default: module.Profile })));
const MyCourses = lazy(() => import('./pages/instructor/courses/MyCourses').then(module => ({ default: module.MyCourses })));
const InstructorCourseContent = lazy(() => import('./pages/instructor/courses/CourseContent').then(module => ({ default: module.CourseContent })));

function InstructorEditCourseRedirect() {
  const { id } = useParams();
  return <Navigate to={`/instructor/courses/${id}/content`} replace />;
}

const CreateModule = lazy(() => import('./pages/instructor/courses/CreateModule').then(module => ({ default: module.CreateModule })));
const CreateLesson = lazy(() => import('./pages/instructor/courses/CreateLesson').then(module => ({ default: module.CreateLesson })));
const InstructorCreateQuiz = lazy(() => import('./pages/instructor/courses/CreateQuiz').then(module => ({ default: module.CreateQuiz })));
const InstructorStudents = lazy(() => import('./pages/instructor/students/Students').then(module => ({ default: module.Students })));
const StudentProgress = lazy(() => import('./pages/instructor/students/StudentProgress').then(module => ({ default: module.StudentProgress })));
const InstructorReviews = lazy(() => import('./pages/instructor/insights/Reviews').then(module => ({ default: module.Reviews })));
const InstructorAnalytics = lazy(() => import('./pages/instructor/insights/Analytics').then(module => ({ default: module.Analytics })));
const InstructorNotifications = lazy(() => import('./pages/instructor/insights/Notifications').then(module => ({ default: module.Notifications })));
const InstructorSettings = lazy(() => import('./pages/instructor/insights/Settings').then(module => ({ default: module.Settings })));

// ──────────────────────────────────────────────────────────────
// 3. ORGANIZATION ADMIN PAGES
// ──────────────────────────────────────────────────────────────
import OrgLayout from './components/organization/OrgLayout';
const OrgDashboard = lazy(() => import('./pages/organization/Dashboard'));
const OrgProfile = lazy(() => import('./pages/organization/Profile'));
const OrgInstructorRequests = lazy(() => import('./pages/organization/InstructorRequests'));
const OrgInstructorRequestDetails = lazy(() => import('./pages/organization/InstructorRequestDetails'));
const OrgInstructors = lazy(() => import('./pages/organization/Instructors'));
const OrgInstructorDetails = lazy(() => import('./pages/organization/InstructorDetails'));
const OrgLearners = lazy(() => import('./pages/organization/Learners'));
const OrgLearnerDetails = lazy(() => import('./pages/organization/LearnerDetails'));
const ModuleRequests = lazy(() => import('./components/workspace/ModuleRequests'));
const OrgCourses = lazy(() => import('./pages/organization/Courses'));
const OrgCourseDetails = lazy(() => import('./pages/organization/CourseDetails'));
const OrgCreateCourse = lazy(() => import('./pages/organization/CreateCourse'));
const OrgEditCourse = lazy(() => import('./pages/organization/EditCourse'));
const OrgAssignCourses = lazy(() => import('./pages/organization/AssignCourses'));
const OrgDisputes = lazy(() => import('./pages/organization/Disputes'));
const OrgAnalytics = lazy(() => import('./pages/organization/Analytics'));

// ──────────────────────────────────────────────────────────────
// 4. PLATFORM ADMIN PAGES & LAYOUT
// ──────────────────────────────────────────────────────────────
import { AdminLayout } from './components/admin/AdminLayout';
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(module => ({ default: module.Dashboard })));
const AdminUsers = lazy(() => import('./pages/admin/Users').then(module => ({ default: module.Users })));
const AdminUserDetails = lazy(() => import('./pages/admin/UserDetails').then(module => ({ default: module.UserDetails })));
const AdminCourses = lazy(() => import('./pages/admin/Courses').then(module => ({ default: module.Courses })));
const AdminCourseDetails = lazy(() => import('./pages/admin/CourseDetails').then(module => ({ default: module.CourseDetails })));
const AdminCourseApproval = lazy(() => import('./pages/admin/CourseApproval').then(module => ({ default: module.CourseApproval })));
const AdminPayments = lazy(() => import('./pages/admin/Payments').then(module => ({ default: module.Payments })));
const AdminTransactions = lazy(() => import('./pages/admin/Transactions').then(module => ({ default: module.Transactions })));
const AdminCertificates = lazy(() => import('./pages/admin/Certificates').then(module => ({ default: module.Certificates })));
const AdminDisputes = lazy(() => import('./pages/admin/Disputes').then(module => ({ default: module.Disputes })));
const AdminProfile = lazy(() => import('./pages/admin/Profile').then(module => ({ default: module.Profile })));
const AdminSettings = lazy(() => import('./pages/admin/Settings').then(module => ({ default: module.Settings })));

// ──────────────────────────────────────────────────────────────
// 5. SUPER ADMIN PLATFORM GOVERNANCE PAGES & LAYOUT
// ──────────────────────────────────────────────────────────────
import { SuperAdminLayout } from './components/super-admin/SuperAdminLayout';
import { SuperAdminGuard } from './components/super-admin/SuperAdminGuard';
const SuperAdminLogin = lazy(() => import('./pages/super-admin/Login'));
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/Dashboard'));
const SuperAdminPayments = lazy(() => import('./pages/super-admin/Payments'));
const SuperAdminAdmins = lazy(() => import('./pages/super-admin/Admins'));
const SuperAdminOrganizations = lazy(() => import('./pages/super-admin/Organizations'));
const SuperAdminLearners = lazy(() => import('./pages/super-admin/Learners'));
const AccountDetails = lazy(() => import('./components/workspace/AccountDetails'));
const AdministratorHistory = lazy(() => import('./components/workspace/AdministratorHistory'));
const SuperAdminSettings = lazy(() => import('./pages/super-admin/Settings'));

function LegacyAdminUserRedirect() {
  const { learnerId, organizationId } = useParams();
  return <Navigate to={`/admin/users/${learnerId || organizationId}`} replace />;
}

function LegacyLearnRedirect() {
  const { courseId } = useParams();
  return <Navigate to={`/student/learn/${courseId}`} replace />;
}

function LegacyCourseRedirect() {
  const { id } = useParams();
  return <Navigate to={`/student/course/${id}`} replace />;
}

function LegacyPlayerRedirect() {
  const location = useLocation();
  const courseId = location.state?.courseId;
  return (
    <Navigate
      to={courseId ? `/student/learn/${courseId}` : '/student/my-learning'}
      replace
    />
  );
}

export default function App() {
  return (
    <Suspense fallback={<main className="academy-route-loading" role="status"><span />Loading your workspace…</main>}><Routes>
      {/* ────────────────────────────────────────────────────────────── */}
      {/* 0. CENTRAL LANDING GATEWAY & SUPER ADMIN (LEVEL 1) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route path="/" element={<Landing />} />

      {/* ── Super Admin: public login + protected portal ──────────── */}
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />

      <Route
        path="/super-admin"
        element={
          <SuperAdminGuard>
            <SuperAdminLayout />
          </SuperAdminGuard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="payments" element={<SuperAdminPayments />} />
        <Route path="admins" element={<SuperAdminAdmins />} />
        <Route path="organizations" element={<SuperAdminOrganizations />} />
        <Route path="learners" element={<SuperAdminLearners />} />
        <Route path="organizations/:userId" element={<AccountDetails superAdmin/>}/>
        <Route path="learners/:userId" element={<AccountDetails superAdmin/>}/>
        <Route path="admins/:userId" element={<AccountDetails superAdmin/>}/>
        <Route path="history" element={<AdministratorHistory/>}/><Route path="disputes" element={<AdminDisputes/>}/><Route path="logs" element={<Logs/>}/><Route path="logs/:id" element={<LogDetails/>}/><Route path="courses/:courseId" element={<AdminCourseDetails/>}/>
        <Route path="notifications" element={<Navigate to="/super-admin/settings?tab=notifications" replace />}/><Route path="settings" element={<SuperAdminSettings />} /><Route path="profile" element={<Navigate to="/super-admin/settings" replace />}/>
      </Route>

      <Route
        path="/organization"
        element={<Navigate to="/org/dashboard" replace />}
      />
      <Route
        path="/organization/landing"
        element={<Navigate to="/signin?role=Organization" replace />}
      />

      <Route path="/signin" element={<SignIn />} />
      <Route path="/verify/:credentialId" element={<VerifyCertificate />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/terms" element={<UnavailablePage />} />
      <Route path="/privacy" element={<UnavailablePage />} />
      <Route path="/honor-code" element={<UnavailablePage />} />

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 1. STUDENT / LEARNER ROUTES (Protected by Route Middleware) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route
        element={
          <RoleGuard allowedRoles={['Student']} loginRole="Student" />
        }
      >
        <Route element={<StudentRouteMiddleware />}>
          <Route
            path="/student"
            element={<Navigate to="/student/dashboard" replace />}
          />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/explore" element={<StudentExplore />} />
          <Route path="/student/course/:id" element={<StudentCourseDetails />} />
          <Route path="/student/checkout" element={<StudentCheckout />} />
          <Route
            path="/student/payment-success"
            element={<StudentPaymentSuccess />}
          />
          <Route path="/student/my-learning" element={<StudentMyLearning />} />
          <Route
            path="/student/learn/:courseId"
            element={<StudentLearningPlayer />}
          />
          <Route path="/student/quiz" element={<StudentQuiz />} />
          <Route
            path="/student/certificates"
            element={<StudentCertificates />}
          />
          <Route path="/student/notifications" element={<Navigate to="/student/profile?tab=notifications" replace/>}/><Route path="/student/settings" element={<Navigate to="/student/profile?tab=security" replace/>}/><Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/billing" element={<StudentBilling />} /><Route path="/student/billing/:paymentId" element={<StudentPaymentReceipt/>}/>
          <Route path="/student/reviews" element={<StudentReviews />} />
          <Route path="/student/disputes" element={<StudentDisputes />} /><Route path="/student/disputes/new" element={<StudentSupportRequest/>}/><Route path="/student/disputes/:disputeId" element={<StudentSupportDetails/>}/>

          {/* Legacy URLs */}
          <Route
            path="/student/course-progress/:courseId"
            element={<LegacyLearnRedirect />}
          />
          <Route
            path="/student/player"
            element={<LegacyPlayerRedirect />}
          />
          <Route
            path="/explore"
            element={<Navigate to="/student/explore" replace />}
          />
          <Route
            path="/my-learning"
            element={<Navigate to="/student/my-learning" replace />}
          />
          <Route
            path="/certificates"
            element={<Navigate to="/student/certificates" replace />}
          />
          <Route
            path="/profile"
            element={<Navigate to="/student/profile" replace />}
          />
          <Route
            path="/reviews"
            element={<Navigate to="/student/reviews" replace />}
          />
          <Route
            path="/disputes"
            element={<Navigate to="/student/disputes" replace />}
          />
          <Route path="/course/:id" element={<LegacyCourseRedirect />} />

          {/* Student Catch-All 404 Route Redirect */}
          <Route
            path="/student/*"
            element={<Navigate to="/student/dashboard" replace />}
          />
        </Route>
      </Route>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2. INSTRUCTOR / EDUCATOR ROUTES */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route
        path="/instructor/login"
        element={<Navigate to="/signin?role=Instructor" replace />}
      />
      <Route
        path="/instructor/register"
        element={<Navigate to="/signup?role=Instructor" replace />}
      />

      <Route
        element={
          <RoleGuard allowedRoles={['Instructor']} loginRole="Instructor" />
        }
      >
        <Route
          path="/instructor"
          element={
            <InstructorProvider>
              <InstructorLayout />
            </InstructorProvider>
          }
        >
          <Route index element={<InstructorDashboard />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="profile" element={<InstructorProfile />} />

          {/* Courses */}
          <Route path="courses" element={<MyCourses />} />
          <Route
            path="courses/:id/edit"
            element={<InstructorEditCourseRedirect />}
          />
          <Route
            path="courses/:id/content"
            element={<InstructorCourseContent />}
          />
          <Route path="courses/module/create" element={<CreateModule />} />
          <Route path="courses/module/:id/edit" element={<CreateModule />} />
          <Route path="courses/lesson/create" element={<CreateLesson />} />
          <Route path="courses/lesson/:id/edit" element={<CreateLesson />} />
          <Route path="courses/quiz/create" element={<InstructorCreateQuiz />} />
          <Route
            path="courses/quiz/:id/edit"
            element={<InstructorCreateQuiz />}
          />

          {/* Students */}
          <Route path="students" element={<InstructorStudents />} />
          <Route path="students/:id" element={<StudentProgress />} />

          {/* Insights & Settings */}
          <Route path="reviews" element={<InstructorReviews />} />
          <Route path="disputes" element={<Navigate to="/instructor/reviews" replace />} />
          <Route path="analytics" element={<Navigate to="/instructor/dashboard" replace />} />
          <Route path="notifications" element={<Navigate to="/instructor/profile?tab=notifications" replace />} />
          <Route path="settings" element={<Navigate to="/instructor/profile?tab=settings" replace />} />
        </Route>
      </Route>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 3. ORGANIZATION ADMIN ROUTES */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route
        element={
          <RoleGuard
            allowedRoles={['Organization']}
            loginRole="Organization"
          />
        }
      >
        <Route path="/org" element={<OrgDashboard />} />
        <Route path="/org/logs" element={<Logs organization/>}/><Route path="/org/logs/:id" element={<LogDetails organization/>}/><Route path="/org/dashboard" element={<OrgDashboard />} />
        <Route path="/organization/dashboard" element={<OrgDashboard />} />

        <Route path="/org/module-requests" element={<Navigate to="/org/courses" replace />}/><Route path="/org/notifications" element={<Navigate to="/org/profile?tab=notifications" replace />}/><Route path="/org/profile" element={<OrgProfile />} />
        <Route path="/organization/profile" element={<OrgProfile />} />

        <Route
          path="/org/instructor-requests"
          element={<OrgInstructorRequests />}
        />
        <Route
          path="/org/instructor-requests/:id"
          element={<OrgInstructorRequestDetails />}
        />
        <Route
          path="/organization/instructor-requests"
          element={<OrgInstructorRequests />}
        />
        <Route
          path="/organization/instructor-requests/:id"
          element={<OrgInstructorRequestDetails />}
        />

        <Route path="/org/instructors" element={<OrgInstructors />} />
        <Route
          path="/org/instructors/:id"
          element={<OrgInstructorDetails />}
        />
        <Route path="/organization/instructors" element={<OrgInstructors />} />
        <Route
          path="/organization/instructors/:id"
          element={<OrgInstructorDetails />}
        />

        <Route path="/org/learners" element={<OrgLearners />} />
        <Route path="/org/learners/:id" element={<OrgLearnerDetails />} />
        <Route path="/organization/learners" element={<OrgLearners />} />
        <Route
          path="/organization/learners/:id"
          element={<OrgLearnerDetails />}
        />

        <Route path="/org/courses" element={<OrgCourses />} />
        <Route path="/org/courses/create" element={<OrgCreateCourse />} />
        <Route path="/org/courses/assign" element={<OrgAssignCourses />} />
        <Route path="/org/assign-courses" element={<OrgAssignCourses />} />
        <Route path="/org/courses/:id" element={<OrgCourseDetails />} />
        <Route path="/org/courses/:id/edit" element={<OrgEditCourse />} />

        <Route path="/organization/courses" element={<OrgCourses />} />
        <Route
          path="/organization/courses/create"
          element={<OrgCreateCourse />}
        />
        <Route
          path="/organization/courses/assign"
          element={<OrgAssignCourses />}
        />
        <Route
          path="/organization/assign-courses"
          element={<OrgAssignCourses />}
        />
        <Route
          path="/organization/courses/:id"
          element={<OrgCourseDetails />}
        />
        <Route
          path="/organization/courses/:id/edit"
          element={<OrgEditCourse />}
        />

        <Route path="/org/disputes" element={<OrgDisputes />} />
        <Route path="/org/raise-dispute" element={<OrgDisputes />} />
        <Route path="/organization/disputes" element={<OrgDisputes />} />
        <Route
          path="/organization/raise-dispute"
          element={<OrgDisputes />}
        />

        <Route
          path="/org/reports"
          element={<Navigate to="/org/dashboard" replace />}
        />
        <Route
          path="/org/settings"
          element={<Navigate to="/org/profile?tab=settings" replace />}
        />
        <Route
          path="/organization/reports"
          element={<Navigate to="/org/dashboard" replace />}
        />
        <Route
          path="/org/analytics"
          element={<Navigate to="/org/dashboard" replace />}
        />
        <Route
          path="/organization/analytics"
          element={<Navigate to="/org/dashboard" replace />}
        />
        <Route
          path="/organization/settings"
          element={<Navigate to="/org/profile?tab=settings" replace />}
        />
      </Route> {/* FIX: closes the Organization RoleGuard route */}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 4. PLATFORM ADMIN ROUTES */}
      {/* ────────────────────────────────────────────────────────────── */}
      <Route
        element={<RoleGuard allowedRoles={['Admin']} loginRole="Admin" />}
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:userId" element={<AdminUserDetails />} />

          {/* Consolidated into Users directory */}
          <Route path="learners" element={<Navigate to="/admin/users?role=Learner" replace />} />
          <Route path="learners/:learnerId" element={<LegacyAdminUserRedirect />} />
          <Route path="instructors" element={<Navigate to="/admin/users?role=Organization" replace />} />
          <Route path="instructors/:instructorId" element={<Navigate to="/admin/users?role=Organization" replace />} />
          <Route path="organizations" element={<Navigate to="/admin/users?role=Organization" replace />} />
          <Route path="organizations/:organizationId" element={<LegacyAdminUserRedirect />} />
          <Route path="organizations/verification" element={<Navigate to="/admin/users?role=Organization" replace />} />
          <Route path="enrollments" element={<Navigate to="/admin/users?role=Learner" replace />} />

          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:courseId" element={<AdminCourseDetails />} />
          <Route path="courses/approval" element={<AdminCourseApproval />} />

          <Route path="disputes" element={<AdminDisputes />} />

          <Route path="payments" element={<AdminPayments />} />
          <Route path="logs" element={<Logs/>}/><Route path="logs/:id" element={<LogDetails/>}/><Route path="transactions" element={<Navigate to="/admin/payments" replace/>} />
          <Route path="refunds" element={<Navigate to="/admin/payments" replace />} />

          <Route path="certificates" element={<AdminCertificates />} />

          {/* Analytics & Reports consolidated in Dashboard */}
          <Route path="analytics" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="reports" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Notifications merged into Settings */}
          <Route path="notifications" element={<Navigate to="/admin/settings?tab=notifications" replace />} />

          <Route path="profile" element={<Navigate to="/admin/settings" replace />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<UnavailablePage />} />
    </Routes></Suspense>
  );
}
