/**
 * Unified Backend API Client Service for NexusPay Enterprise EdTech Platform
 * Supports all 4 platform actors: Student, Instructor, Organization, Admin
 * Connects directly to unified NestJS backend at http://localhost:3000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('nexuspay_auth_token') || localStorage.getItem('nexuspay_student_token');
  const role = options.role || localStorage.getItem('nexuspay_active_role') || 'Student';

  const headers = {
    'Content-Type': 'application/json',
    'x-role': role.toLowerCase(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    if (response.status === 204) return null;

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = result?.message || result?.error || `HTTP error ${response.status}`;
      const err = new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
      err.status = response.status;
      err.data = result;
      throw err;
    }

    // Unpack TransformResponseInterceptor format if present
    return result && typeof result === 'object' && 'data' in result ? result.data : result;
  } catch (error) {
    console.warn(`API request notice [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // 1. Authentication & Session
  auth: {
    login: (email, password, role) => request('/auth/login', { method: 'POST', body: { email, password, role } }),
    register: (data) => request('/auth/register', { method: 'POST', body: data }),
    getMe: (userId) => request('/auth/me', { headers: { 'x-user-id': userId } }),
    changePassword: (currentPassword, newPassword, userId) =>
      request('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
        headers: { 'x-user-id': userId },
      }),
  },

  // 2. Student / Learner LMS
  student: {
    getProfile: (userId) => request('/student/profile', { headers: { 'x-user-id': userId } }),
    updateProfile: (data, userId) => request('/student/profile', { method: 'PUT', body: data, headers: { 'x-user-id': userId } }),
    getOrganizations: () => request('/student/organizations'),
    joinOrganization: (organizationId, organizationName, userId) =>
      request('/student/join-organization', {
        method: 'POST',
        body: { organizationId, organizationName },
        headers: { 'x-user-id': userId },
      }),
    getEnrollments: (userId) => request('/student/enrollments', { headers: { 'x-user-id': userId } }),
    enroll: (courseId, userId) => request('/student/enrollments', { method: 'POST', body: { courseId }, headers: { 'x-user-id': userId } }),
    updateProgress: (enrollmentId, lessonId, completed, userId) =>
      request(`/student/enrollments/${enrollmentId}/progress`, {
        method: 'PATCH',
        body: { lessonId, completed },
        headers: { 'x-user-id': userId },
      }),
    getCertificates: (userId) => request('/student/certificates', { headers: { 'x-user-id': userId } }),
    getPayments: (userId) => request('/student/payments', { headers: { 'x-user-id': userId } }),
    checkout: (courseId, paymentMethod, amount, userId) =>
      request('/student/payments/checkout', {
        method: 'POST',
        body: { courseId, paymentMethod, amount },
        headers: { 'x-user-id': userId },
      }),
  },

  // 3. Courses, Modules, Lessons & Curriculum
  courses: {
    list: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/courses${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/courses/${id}`),
    create: (data) => request('/courses', { method: 'POST', body: data }),
    update: (id, data) => request(`/courses/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
    getReviews: (id) => request(`/reviews/course/${id}`),
    addReview: (courseId, rating, comment, learnerName) =>
      request('/reviews', { method: 'POST', body: { courseId, rating, comment, learnerName } }),
  },

  // 4. Quizzes & Academic Assessments
  quizzes: {
    list: () => request('/quizzes'),
    get: (id) => request(`/quizzes/${id}`),
    getByCourse: (courseId) => request(`/quizzes/course/${courseId}`),
    create: (data) => request('/quizzes', { method: 'POST', body: data }),
    addQuestion: (data) => request('/quizzes/questions', { method: 'POST', body: data }),
    submit: (quizId, answers, userId) =>
      request(`/quizzes/${quizId}/submit`, { method: 'POST', body: { answers }, headers: { 'x-user-id': userId } }),
  },

  // 5. Practical Assignments & Submissions
  assignments: {
    list: () => request('/assignments'),
    get: (id) => request(`/assignments/${id}`),
    getByCourse: (courseId) => request(`/assignments/course/${courseId}`),
    create: (data) => request('/assignments', { method: 'POST', body: data }),
    submit: (id, data) => request(`/assignments/${id}/submit`, { method: 'POST', body: data }),
    grade: (submissionId, score, feedback) =>
      request(`/assignments/submissions/${submissionId}/grade`, { method: 'POST', body: { score, feedback } }),
  },

  // 6. Certificates & Credentials
  certificates: {
    list: () => request('/certificates'),
    get: (id) => request(`/certificates/${id}`),
    verify: (credentialId) => request(`/certificates/verify/${credentialId}`),
    issue: (data) => request('/certificates', { method: 'POST', body: data }),
  },

  // 7. Organization Administration
  organization: {
    get: () => request('/organization'),
    update: (data) => request('/organization', { method: 'PATCH', body: data }),
    getStats: () => request('/organization/stats'),
    getStudentRequests: () => request('/organization/student-requests'),
    respondStudentRequest: (learnerId, action) =>
      request(`/organization/student-requests/${learnerId}/respond`, { method: 'POST', body: { action } }),
    listInstitutions: () => request('/organizations'),
    verifyInstitution: (id, data) => request(`/organizations/${id}/verify`, { method: 'PATCH', body: data }),
  },

  // 8. Instructors & Teaching Faculty
  instructors: {
    list: (params = { limit: 1000 }) => {
      const query = new URLSearchParams(params).toString();
      return request(`/instructors${query ? `?${query}` : ''}`);
    },
    get: (id) => request(`/instructors/${id}`),
    create: (data) => request('/instructors', { method: 'POST', body: data }),
    update: (id, data) => request(`/instructors/${id}`, { method: 'PATCH', body: data }),
    getRequests: () => request('/instructor-requests'),
    respondRequest: (id, action, notes) =>
      request(`/instructor-requests/${id}/respond`, { method: 'POST', body: { action, notes } }),
  },

  // 9. Platform Admin & User Management
  users: {
    list: () => request('/users'),
    get: (id) => request(`/users/${id}`),
    create: (data) => request('/users', { method: 'POST', body: data }),
    update: (id, data) => request(`/users/${id}`, { method: 'PATCH', body: data }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  },

  // 10. Financial Settlements, Payments & Refunds
  payments: {
    getTransactions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/payments/transactions${query ? `?${query}` : ''}`);
    },
    getSummary: () => request('/payments/summary'),
    getRefunds: () => request('/refunds'),
    processRefund: (data) => request('/refunds', { method: 'POST', body: data }),
  },

  // 11. Disputes & Governance
  disputes: {
    list: () => request('/disputes'),
    get: (id) => request(`/disputes/${id}`),
    raise: (data) => request('/disputes', { method: 'POST', body: data }),
    updateStatus: (id, status, notes) =>
      request(`/disputes/${id}/status`, { method: 'PATCH', body: { status, adminNotes: notes } }),
    resolve: (id, resolutionNotes) =>
      request(`/disputes/${id}/resolve`, { method: 'POST', body: { resolutionNotes } }),
  },

  // 12. Reports & Analytics Telemetry
  reports: {
    list: () => request('/reports'),
    generate: (data) => request('/reports/generate', { method: 'POST', body: data }),
    exportCsv: (collection) => request(`/reports/export/${collection}`),
  },
  analytics: {
    getOverview: () => request('/analytics/overview'),
    getSuperAdmin: () => request('/analytics/super-admin'),
    getInstructor: () => request('/analytics/instructor'),
    getTimeframe: (tf) => request(`/analytics/timeframe/${tf}`),
  },

  // 13. Notifications & System Settings
  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
  },
  settings: {
    get: () => request('/settings'),
    update: (data) => request('/settings', { method: 'PATCH', body: data }),
  },

  // 14. Super Admin Governance
  superAdmin: {
    getAnalytics: () => request('/analytics/super-admin'),
    getAdmins: () => request('/users?role=Admin'),
    createAdmin: (data) => request('/users', { method: 'POST', body: { ...data, role: 'Admin' } }),
    getOrganizations: () => request('/organization/stats'),
    getSystemLogs: () => request('/analytics/super-admin'),
  },
};

export default api;

