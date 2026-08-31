import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { orgData as fallbackData } from '../data/orgData';
import { api } from '../services/api';

const OrgContext = createContext();

export function OrgProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [state, setState] = useState({
    info: { ...fallbackData.info },
    instructors: [...fallbackData.instructors],
    instructorRequests: [
      {
        id: "req-101",
        instructorId: "inst-2",
        name: "Dr. Sarah Mitchell",
        email: "s.mitchell@stanford.edu",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
        specialization: "Machine Learning & FinTech AI",
        courseTitle: "Transformers in Quantitative Finance & Fraud Detection",
        semester: "Fall 2026",
        creditHours: "4 Academic Credits",
        sentDate: "August 20, 2026",
        status: "Pending Professor Response",
        outreachMethod: "Sent request by mail",
        mailSubject: "College Teaching Assignment: Transformers in Quantitative Finance",
        description: "College administration sent formal course teaching request by mail to Dr. Sarah Mitchell to instruct 'Transformers in Quantitative Finance' for Fall 2026.",
        bio: "Lead AI Researcher and PhD from MIT. Leads fintech fraud detection AI algorithms and predictive market analytics.",
        sampleSyllabus: "12-week intensive masterclass on Transformers in Quantitative Finance",
        proposedTerms: "Academic Honorarium + 70/30 faculty course royalty",
        trackingStatus: "Awaiting professor decision • Dispatched to s.mitchell@stanford.edu",
        adminNotes: "Dispatched by Dean of Computer Science. Awaiting professor acceptance."
      },
      {
        id: "req-102",
        instructorId: "inst-1",
        name: "Prof. James Wilson",
        email: "j.wilson@nexuspay.edu",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        specialization: "Cloud Architecture & AWS",
        courseTitle: "AWS Solutions Architect & High-Throughput Settlement Engines",
        semester: "Fall 2026",
        creditHours: "4 Academic Credits",
        sentDate: "August 22, 2026",
        status: "Pending Professor Response",
        outreachMethod: "Sent request by mail",
        mailSubject: "College Teaching Assignment: AWS Solutions Architect Masterclass",
        description: "College administration sent formal course teaching request by mail to Prof. James Wilson to instruct 'AWS Solutions Architect' for Fall 2026.",
        bio: "Former Principal Cloud Architect at AWS with 14+ years designing high-throughput transaction engines.",
        sampleSyllabus: "Enterprise AWS cloud architecture with active-active multi-region failover",
        proposedTerms: "Standard departmental faculty appointment",
        trackingStatus: "Awaiting professor decision • Dispatched to j.wilson@nexuspay.edu",
        adminNotes: "Teaching syllabus approved by College Academic Council."
      },
      {
        id: "req-103",
        instructorId: "inst-3",
        name: "Marcus Vance",
        email: "m.vance@nexuspay.edu",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        specialization: "Cybersecurity & PCI-DSS",
        courseTitle: "Post-Quantum Cryptography & Banking Ledger Defense",
        semester: "Fall 2026",
        creditHours: "3 Academic Credits",
        sentDate: "August 24, 2026",
        status: "Pending Professor Response",
        outreachMethod: "Sent request by mail",
        mailSubject: "College Teaching Assignment: Post-Quantum Cryptography & Banking Defense",
        description: "College administration sent formal course teaching request by mail to Marcus Vance to instruct 'Post-Quantum Cryptography' for Fall 2026.",
        bio: "CISSP certified security executive overseeing institutional banking security and cryptographic key management.",
        sampleSyllabus: "Zero-trust banking security, hardware security modules, and PCI-DSS 4.0",
        proposedTerms: "Departmental research stipend + lab grant",
        trackingStatus: "Awaiting professor decision • Dispatched to m.vance@nexuspay.edu",
        adminNotes: "Sent by Academic Committee on Aug 24, 2026."
      },
      {
        id: "req-104",
        instructorId: "inst-4",
        name: "Elena Rostova",
        email: "e.rostova@nexuspay.edu",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        specialization: "DevOps & CI/CD Pipelines",
        courseTitle: "Zero-Downtime Microservices & Kubernetes Payments Cluster",
        semester: "Fall 2026",
        creditHours: "4 Academic Credits",
        sentDate: "August 10, 2026",
        status: "Accepted by Professor",
        outreachMethod: "Sent request by mail",
        mailSubject: "College Teaching Assignment: Zero-Downtime Microservices",
        description: "College sent course teaching request by mail on Aug 10. Elena Rostova accepted the teaching assignment. College received notification and course is assigned.",
        bio: "DevOps lead with 10 years experience automating resilient payment gateways and zero-downtime microservice clusters.",
        sampleSyllabus: "Automated GitOps, ArgoCD pipelines, and high-availability Kubernetes",
        proposedTerms: "Accepted 70/30 faculty agreement",
        trackingStatus: "Accepted by Professor • Official Notification Sent to College",
        adminNotes: "Elena accepted on Aug 14; College notified and class scheduled."
      },
      {
        id: "req-105",
        instructorId: "inst-5",
        name: "David Kalu",
        email: "d.kalu@nexuspay.edu",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        specialization: "Blockchain & Smart Contracts",
        courseTitle: "Programmable Settlement Smart Contracts & DeFi Rails",
        semester: "Fall 2026",
        creditHours: "3 Academic Credits",
        sentDate: "July 28, 2026",
        status: "Declined by Professor",
        outreachMethod: "Sent request by mail",
        mailSubject: "College Teaching Assignment: Programmable Settlement Smart Contracts",
        description: "College sent course teaching request by mail. David Kalu declined due to academic research leave / sabbatical.",
        bio: "Pioneer in decentralized payment protocols, liquidity pools, and programmable settlement smart contracts.",
        sampleSyllabus: "Solidity settlement contracts and multi-sig asset custody",
        proposedTerms: "Standard faculty honorarium",
        trackingStatus: "Declined by Professor (Sabbatical leave)",
        adminNotes: "Declined politely citing ongoing fellowship abroad."
      }
    ],
    learners: [...fallbackData.learners],
    courses: [...fallbackData.courses],
    enrollments: [...fallbackData.enrollments],
    transactions: [...fallbackData.transactions],
    reports: [...fallbackData.reports],
    disputes: [...(fallbackData.disputes || [])],
    notifications: [...fallbackData.notifications],
    settings: {
      autoApproveEnrollments: true,
      emailAlerts: true,
      royaltyAlerts: true,
      weeklyDigest: false,
      requireTwoFactor: true,
      defaultCurrency: 'USD',
      defaultAccessType: 'Paid Masterclass'
    }
  });

  // Helper to extract items from paginated or raw backend responses
  const getItems = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.items)) return res.items;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  // Fetch all collections from the backend JSON database
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        orgRes,
        instructorsRes,
        requestsRes,
        learnersRes,
        coursesRes,
        enrollmentsRes,
        transactionsRes,
        reportsRes,
        disputesRes,
        notificationsRes,
        settingsRes,
      ] = await Promise.allSettled([
        api.organization.get(),
        api.instructors.list({ limit: 1000 }),
        api.instructorRequests.list({ limit: 1000 }),
        api.learners.list({ limit: 1000 }),
        api.courses.list({ limit: 1000 }),
        api.enrollments.list({ limit: 1000 }),
        api.payments.listTransactions({ limit: 1000 }),
        api.reports.list({ limit: 1000 }),
        api.disputes.list({ limit: 1000 }),
        api.notifications.list({ limit: 1000 }),
        api.settings.get(),
      ]);

      setState((prev) => ({
        info: orgRes.status === 'fulfilled' && orgRes.value ? orgRes.value : prev.info,
        instructors: instructorsRes.status === 'fulfilled' ? getItems(instructorsRes.value) : prev.instructors,
        instructorRequests: requestsRes.status === 'fulfilled' ? getItems(requestsRes.value) : prev.instructorRequests,
        learners: learnersRes.status === 'fulfilled' ? getItems(learnersRes.value) : prev.learners,
        courses: coursesRes.status === 'fulfilled' ? getItems(coursesRes.value) : prev.courses,
        enrollments: enrollmentsRes.status === 'fulfilled' ? getItems(enrollmentsRes.value) : prev.enrollments,
        transactions: transactionsRes.status === 'fulfilled' ? getItems(transactionsRes.value) : prev.transactions,
        reports: reportsRes.status === 'fulfilled' ? getItems(reportsRes.value) : prev.reports,
        disputes: disputesRes.status === 'fulfilled' ? getItems(disputesRes.value) : prev.disputes,
        notifications: notificationsRes.status === 'fulfilled' ? getItems(notificationsRes.value) : prev.notifications,
        settings: settingsRes.status === 'fulfilled' && settingsRes.value ? settingsRes.value : prev.settings,
      }));
    } catch (err) {
      console.error('Failed to load data from backend JSON database:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load from backend on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Dynamic Statistics
  const stats = {
    totalInstructors: state.instructors.length,
    totalLearners: state.learners.length,
    activeCourses: state.courses.length,
    totalEnrollments: state.enrollments.length,
    pendingRequests: state.instructorRequests.filter(
      (r) =>
        r.status === 'Pending Professor Response' ||
        r.status === 'Invite Sent' ||
        r.status === 'Pending' ||
        r.status?.toLowerCase().includes('pending')
    ).length,
    openDisputes: (state.disputes || []).filter((d) => d.status !== 'Resolved').length,
    unreadNotifications: state.notifications.filter((n) => !n.read).length,
    annualRevenue: state.courses.reduce((sum, c) => sum + (c.revenue || (c.price * (c.enrolledCount || 10))), 0),
    monthlyRevenue: Math.round(state.courses.reduce((sum, c) => sum + (c.revenue || (c.price * (c.enrolledCount || 10))), 0) * 0.3),
  };

  // --- ACTIONS (Updating backend JSON files directly) ---

  // 1. Organization Profile
  const updateOrgInfo = async (newInfo) => {
    try {
      const updated = await api.organization.update(newInfo);
      setState((prev) => ({ ...prev, info: { ...prev.info, ...(updated || newInfo) } }));
      return updated;
    } catch (err) {
      console.error('Failed to update organization profile:', err);
      // Optimistic local update as fallback
      setState((prev) => ({ ...prev, info: { ...prev.info, ...newInfo } }));
      throw err;
    }
  };

  // 2. Course Management
  const addCourse = async (courseData) => {
    try {
      // Resolve assigned instructors
      let assignedInstructors = [];
      if (courseData.instructors && Array.isArray(courseData.instructors) && courseData.instructors.length > 0) {
        assignedInstructors = courseData.instructors;
      } else {
        const lead = state.instructors.find((i) => i.id === courseData.instructorId || i.id === courseData.leadInstructorId) || state.instructors[0];
        assignedInstructors = [
          {
            id: lead.id,
            name: lead.name,
            role: 'Lead Instructor',
            avatar: lead.avatar,
            specialization: lead.specialization,
          },
        ];
        if (Array.isArray(courseData.coInstructorIds)) {
          courseData.coInstructorIds.forEach((cId) => {
            if (cId !== lead.id) {
              const co = state.instructors.find((i) => i.id === cId);
              if (co) {
                assignedInstructors.push({
                  id: co.id,
                  name: co.name,
                  role: 'Co-Instructor',
                  avatar: co.avatar,
                  specialization: co.specialization,
                });
              }
            }
          });
        }
      }

      const leadInstructor = assignedInstructors[0] || state.instructors[0];

      const payload = {
        title: courseData.title,
        category: courseData.category || 'Cloud Architecture',
        level: courseData.level || 'Advanced',
        instructorId: leadInstructor.id,
        coInstructorIds: courseData.coInstructorIds || [],
        instructors: assignedInstructors,
        price: parseFloat(courseData.price) || 89.99,
        status: courseData.status || 'Published',
        thumbnail: courseData.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
        description: courseData.description || 'Newly authored curriculum track on enterprise architecture.',
        modules: courseData.modules || [
          { id: 'mod-1', title: 'Module 1: Architecture Foundations', lessons: 4, duration: '3h 15m' },
          { id: 'mod-2', title: 'Module 2: High Throughput Replication', lessons: 5, duration: '4h 00m' },
        ],
      };

      const created = await api.courses.create(payload);

      setState((prev) => ({
        ...prev,
        courses: [created, ...prev.courses.filter((c) => c.id !== created.id)],
      }));

      return created;
    } catch (err) {
      console.error('Failed to create course on backend:', err);
      throw err;
    }
  };

  const updateCourse = async (courseId, updatedData) => {
    try {
      const payload = {
        ...updatedData,
        price: parseFloat(updatedData.price) || updatedData.price,
      };

      const updated = await api.courses.update(courseId, payload);

      setState((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => (c.id === courseId ? { ...c, ...(updated || payload) } : c)),
      }));

      return updated;
    } catch (err) {
      console.error('Failed to update course on backend:', err);
      throw err;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await api.courses.delete(courseId);
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== courseId),
      }));
    } catch (err) {
      console.error('Failed to delete course on backend:', err);
      // Optimistic delete
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== courseId),
      }));
      throw err;
    }
  };

  // 3. College Course Teaching Requests
  const sendCourseTeachingRequest = async ({ instructorId, courseId, courseTitle, semester, creditHours, proposedTerms, message }) => {
    try {
      const payload = {
        instructorId,
        courseId,
        courseTitle: courseTitle || 'Advanced Distributed Systems',
        semester: semester || 'Fall 2026',
        creditHours: creditHours || '4 Academic Credits',
        proposedTerms: proposedTerms || 'Departmental faculty honorarium + course royalties',
        message: message || `College administration sent formal course teaching request for ${courseTitle}.`,
      };

      const created = await api.instructorRequests.create(payload);

      // Refresh requests and notifications from backend
      const [requestsRes, notifsRes] = await Promise.all([
        api.instructorRequests.list({ limit: 1000 }),
        api.notifications.list({ limit: 1000 }),
      ]);

      setState((prev) => ({
        ...prev,
        instructorRequests: getItems(requestsRes),
        notifications: getItems(notifsRes),
      }));

      return created;
    } catch (err) {
      console.error('Failed to send teaching request on backend:', err);
      throw err;
    }
  };

  const respondToTeachingRequest = async (requestId, decision, notes) => {
    try {
      const updated = await api.instructorRequests.respond(requestId, decision, notes);

      // Re-fetch requests, courses, and notifications from backend
      const [requestsRes, coursesRes, notifsRes] = await Promise.all([
        api.instructorRequests.list({ limit: 1000 }),
        api.courses.list({ limit: 1000 }),
        api.notifications.list({ limit: 1000 }),
      ]);

      setState((prev) => ({
        ...prev,
        instructorRequests: getItems(requestsRes),
        courses: getItems(coursesRes),
        notifications: getItems(notifsRes),
      }));

      return updated;
    } catch (err) {
      console.error('Failed to respond to teaching request on backend:', err);
      throw err;
    }
  };

  // 4. Enrollments & Course Assignment
  const assignCoursesToLearners = async (courseIds, learnerIds) => {
    try {
      const result = await api.enrollments.assign(courseIds, learnerIds);

      // Re-fetch enrollments, courses, learners, transactions, notifications
      const [enrollmentsRes, coursesRes, learnersRes, transactionsRes, notifsRes] = await Promise.all([
        api.enrollments.list({ limit: 1000 }),
        api.courses.list({ limit: 1000 }),
        api.learners.list({ limit: 1000 }),
        api.payments.listTransactions({ limit: 1000 }),
        api.notifications.list({ limit: 1000 }),
      ]);

      setState((prev) => ({
        ...prev,
        enrollments: getItems(enrollmentsRes),
        courses: getItems(coursesRes),
        learners: getItems(learnersRes),
        transactions: getItems(transactionsRes),
        notifications: getItems(notifsRes),
      }));

      return result;
    } catch (err) {
      console.error('Failed to assign courses on backend:', err);
      throw err;
    }
  };

  // 5. Reports
  const generateReport = async (reportTitle, reportType) => {
    try {
      const created = await api.reports.generate(reportTitle, reportType);

      setState((prev) => ({
        ...prev,
        reports: [created, ...prev.reports.filter((r) => r.id !== created.id)],
      }));

      return created;
    } catch (err) {
      console.error('Failed to generate report on backend:', err);
      // Fallback local creation
      const localReport = {
        id: `rep-${Date.now()}`,
        title: reportTitle,
        type: reportType || 'Analytics Audit',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: '2.4 MB',
        format: 'CSV',
      };
      setState((prev) => ({ ...prev, reports: [localReport, ...prev.reports] }));
      return localReport;
    }
  };

  // 6. Notifications
  const markNotificationRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    } catch (err) {
      console.error('Failed to mark notification as read on backend:', err);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read on backend:', err);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      }));
    }
  };

  // 7. Disputes Management
  const raiseDispute = async (disputeData) => {
    try {
      const payload = {
        disputeType: disputeData.disputeType || 'General Institutional Dispute',
        subject: disputeData.subject || 'Administrative Operational Dispute',
        description: disputeData.description || '',
        courseTitle: disputeData.courseTitle || '',
        courseId: disputeData.courseId || '',
        priority: disputeData.priority || 'Medium',
        raisedBy: disputeData.raisedBy || state.info.name || 'NexusPay Enterprise Academy',
        raisedById: disputeData.raisedById || state.info.id || 'org-101',
        raisedByRole: disputeData.raisedByRole || 'Organization',
        desiredResolution: disputeData.desiredResolution || 'Prompt review and resolution by administration.',
      };

      const created = await api.disputes.create(payload);

      // Re-fetch disputes and notifications
      const [disputesRes, notifsRes] = await Promise.all([
        api.disputes.list({ limit: 1000 }),
        api.notifications.list({ limit: 1000 }),
      ]);

      setState((prev) => ({
        ...prev,
        disputes: getItems(disputesRes),
        notifications: getItems(notifsRes),
      }));

      return created;
    } catch (err) {
      console.error('Failed to raise dispute on backend:', err);
      throw err;
    }
  };

  const updateDisputeStatus = async (disputeId, newStatus, adminNote) => {
    try {
      const updated = await api.disputes.updateStatus(disputeId, newStatus, adminNote);

      setState((prev) => ({
        ...prev,
        disputes: (prev.disputes || []).map((d) => (d.id === disputeId ? { ...d, ...(updated || {}), status: newStatus } : d)),
      }));

      return updated;
    } catch (err) {
      console.error('Failed to update dispute status on backend:', err);
      setState((prev) => ({
        ...prev,
        disputes: (prev.disputes || []).map((d) => (d.id === disputeId ? { ...d, status: newStatus } : d)),
      }));
    }
  };

  const resolveDispute = async (disputeId, resolutionNote) => {
    try {
      const updated = await api.disputes.resolve(disputeId, resolutionNote || 'Resolved by Organization Administration.');

      // Refresh disputes & notifications
      const [disputesRes, notifsRes] = await Promise.all([
        api.disputes.list({ limit: 1000 }),
        api.notifications.list({ limit: 1000 }),
      ]);

      setState((prev) => ({
        ...prev,
        disputes: getItems(disputesRes),
        notifications: getItems(notifsRes),
      }));

      return updated;
    } catch (err) {
      console.error('Failed to resolve dispute on backend:', err);
      await updateDisputeStatus(disputeId, 'Resolved', resolutionNote);
    }
  };

  // 8. Settings & Database Reset
  const updateSettings = async (newSettings) => {
    try {
      const updated = await api.settings.update(newSettings);
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...(updated || newSettings) },
      }));
      return updated;
    } catch (err) {
      console.error('Failed to update settings on backend:', err);
      setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...newSettings },
      }));
      throw err;
    }
  };

  // Reset database to initial default JSON seed datasets
  const resetToDefault = async () => {
    try {
      await api.settings.resetDatabase();
      await refreshData();
    } catch (err) {
      console.error('Failed to reset backend JSON database:', err);
      await refreshData();
    }
  };

  return (
    <OrgContext.Provider
      value={{
        info: state.info,
        instructors: state.instructors,
        instructorRequests: state.instructorRequests,
        learners: state.learners,
        courses: state.courses,
        enrollments: state.enrollments,
        transactions: state.transactions,
        reports: state.reports,
        disputes: state.disputes || [],
        notifications: state.notifications,
        settings: state.settings,
        stats,
        isLoading,
        error,
        refreshData,
        // Actions
        updateOrgInfo,
        addCourse,
        updateCourse,
        deleteCourse,
        sendCourseTeachingRequest,
        respondToTeachingRequest,
        assignCoursesToLearners,
        generateReport,
        raiseDispute,
        updateDisputeStatus,
        resolveDispute,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        resetToDefault,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
