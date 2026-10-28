import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRemoteData } from '../hooks/useRemoteData';
const Context = createContext(null);
export function AdminSessionProvider({ children }) {
  const state = useRemoteData('/admin/session');
  const { pathname } = useLocation();
  useEffect(() => {
    state.refresh();
  }, [pathname, state.refresh]);
  useEffect(() => {
    const changed = () => state.refresh();
    window.addEventListener('admin-data-changed', changed);
    return () => window.removeEventListener('admin-data-changed', changed);
  }, [state.refresh]);
  return (
    <Context.Provider
      value={{
        ...state,
        profile: state.data?.profile,
        unreadNotifications: state.data?.unreadNotifications || 0,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAdminSession = () => useContext(Context);
