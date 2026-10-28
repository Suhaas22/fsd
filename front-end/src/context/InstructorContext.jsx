import React, { useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../services/api';
import { InstructorContext } from './instructorContextValue';

const itemsOf = (res) => (Array.isArray(res) ? res : res?.items || []);

export function InstructorProvider({ children }) {
  const [instructor, setInstructor] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInstructorData = useCallback(async () => {
    setError(null);
    try {
      const workspace = await api.get('/workspace/instructor');
      const me = workspace.instructor;
      if (!me)
        throw new Error('No instructor profile is linked to this account');
      setInstructor(me);
      localStorage.setItem('nexuspay_instructor_id', me.id);

      const [invRes, joinRes, coursesRes] = await Promise.allSettled([
        api.instructorRequests.list({ instructorId: me.id, limit: 1000 }),
        api.instructorRequests.myJoinRequests(),
        Promise.resolve(workspace.courses),
      ]);
      setInvitations(
        invRes.status === 'fulfilled' ? itemsOf(invRes.value) : [],
      );
      setJoinRequests(
        joinRes.status === 'fulfilled' ? itemsOf(joinRes.value) : [],
      );
      setAssignedCourses(
        coursesRes.status === 'fulfilled' ? itemsOf(coursesRes.value) : [],
      );
    } catch (err) {
      setInstructor(null);
      setAssignedCourses([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructorData();
    window.addEventListener('account-changed', fetchInstructorData);
    window.addEventListener('focus', fetchInstructorData);
    window.addEventListener('learning-data-changed', fetchInstructorData);
    return () => {
      window.removeEventListener('account-changed', fetchInstructorData);
      window.removeEventListener('focus', fetchInstructorData);
      window.removeEventListener('learning-data-changed', fetchInstructorData);
    };
  }, [fetchInstructorData]);

  const run = async (fn) => {
    setActionLoading(true);
    try {
      const result = await fn();
      await fetchInstructorData();
      return result;
    } finally {
      setActionLoading(false);
    }
  };

  const isAffiliated =
    Boolean(instructor?.organizationId) && instructor?.status === 'Active';

  const isPendingStatus = (s) => /pending|sent/i.test(s || '');

  // Stage 1: Organization association invitations (Org -> Instructor)
  // Only valid when instructor is unaffiliated, or for review
  const pendingOrgInvitations = invitations.filter(
    (i) =>
      isPendingStatus(i.status) &&
      (i.type === 'org-invitation' ||
        !i.courseId ||
        i.courseTitle === 'General Course Assignment'),
  );

  // Stage 2: Course teaching requests (Org -> Instructor)
  // Rule: An instructor MUST already be affiliated with the organization to receive course requests!
  const pendingCourseRequests = [];

  const pendingCount = isAffiliated
    ? pendingCourseRequests.length
    : pendingOrgInvitations.length;

  const value = {
    instructor,
    isAffiliated,
    invitations,
    pendingCourseRequests,
    pendingOrgInvitations,
    pendingCount,
    assignedCourses,
    loading,
    actionLoading,
    error,
    refreshInstructor: fetchInstructorData,
    acceptOrgInvitation: (id, notes) =>
      run(() => api.instructorRequests.respond(id, 'Accepted', notes)),
    declineOrgInvitation: (id, notes) =>
      run(() => api.instructorRequests.respond(id, 'Declined', notes)),
    acceptInvitation: (id, notes) =>
      run(() => api.instructorRequests.respond(id, 'Accepted', notes)),
    declineInvitation: (id, notes) =>
      run(() => api.instructorRequests.respond(id, 'Declined', notes)),
    acceptCourseRequest: (id, notes) =>
      run(() => api.instructorRequests.respond(id, 'Accepted', notes)),
    declineCourseRequest: (id, notes) =>
      run(() => api.instructorRequests.respond(id, 'Declined', notes)),
    leaveOrganization: () =>
      run(() => api.instructors.leaveOrganization(instructor.id)),
  };

  return (
    <InstructorContext.Provider value={value}>
      {children}
    </InstructorContext.Provider>
  );
}

const defaultInstructorContext = {
  instructor: null,
  isAffiliated: false,
  invitations: [],
  pendingCourseRequests: [],
  pendingOrgInvitations: [],
  pendingCount: 0,
  assignedCourses: [],
  loading: false,
  actionLoading: false,
  error: null,
  refreshInstructor: async () => {},
  acceptOrgInvitation: async () => {},
  declineOrgInvitation: async () => {},
  acceptInvitation: async () => {},
  declineInvitation: async () => {},
  acceptCourseRequest: async () => {},
  declineCourseRequest: async () => {},
  leaveOrganization: async () => {},
};

export function useInstructor() {
  return useContext(InstructorContext) || defaultInstructorContext;
}
