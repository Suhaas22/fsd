import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { api } from '../services/api';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshData = useCallback(async () => {
    setError(null);
    const [profileRes, enrollmentsRes, certsRes] = await Promise.allSettled([
      api.student.getProfile(),
      api.student.getEnrollments(),
      api.student.getCertificates(),
    ]);
    if (profileRes.status === 'fulfilled') setStudent(profileRes.value);
    else {
      setStudent(null);
      setError(profileRes.reason);
    }
    if (enrollmentsRes.status === 'fulfilled')
      setEnrollments(
        Array.isArray(enrollmentsRes.value) ? enrollmentsRes.value : []
      );
    else {
      setEnrollments([]);
      setError(enrollmentsRes.reason);
    }
    if (certsRes.status === 'fulfilled')
      setCertificates(Array.isArray(certsRes.value) ? certsRes.value : []);
    else {
      setCertificates([]);
      setError(certsRes.reason);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
    window.addEventListener('focus', refreshData);
    window.addEventListener('learning-data-changed', refreshData);
    return () => {
      window.removeEventListener('focus', refreshData);
      window.removeEventListener('learning-data-changed', refreshData);
    };
  }, [refreshData]);

  const updateProfile = useCallback(async (updates) => {
    const updated = await api.student.updateProfile(updates);
    setStudent(updated);
    if (updated?.name) localStorage.setItem('user_name', updated.name);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      student,
      enrollments,
      certificates,
      isLoading,
      error,
      refreshData,
      updateProfile,
    }),
    [
      student,
      enrollments,
      certificates,
      isLoading,
      error,
      refreshData,
      updateProfile,
    ]
  );

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context)
    throw new Error('useStudent must be used within a <StudentProvider>');
  return context;
}

export default StudentContext;
