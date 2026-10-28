import React from 'react';
import { useSearchParams } from 'react-router-dom';
import StudentPage from '../../components/student/StudentPage';
import CourseCard from '../../components/student/CourseCard';
import { useRemoteData } from '../../hooks/useRemoteData';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  AdminHeader,
  AdminDataState,
  AdminSearch,
  AdminEmpty,
} from '../../components/admin/AdminUI';
import { Pagination } from '../../components/admin/Pagination';
export default function ExploreCourses() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const settled = useDebouncedValue(search);
  const state = useRemoteData(
    `/student/catalog/browse?${new URLSearchParams({ search: settled, page: params.get('page') || '1', limit: 9 })}`
  );
  const data = state.data;
  function update(key, value) {
    setParams(
      (old) => {
        const next = new URLSearchParams(old);
        value ? next.set(key, value) : next.delete(key);
        if (key !== 'page') next.delete('page');
        return next;
      },
      { replace: true }
    );
  }
  return (
    <StudentPage>
      <AdminHeader title="Browse courses" />
      <div className="admin-toolbar">
        <AdminSearch
          value={search}
          onChange={(v) => update('q', v)}
          placeholder="Search course, instructor or institute…"
        />
      </div>
      <AdminDataState
        loading={state.loading || search !== settled}
        error={state.error}
        refresh={state.refresh}
      />
      {data && !state.error && (
        <>
          <p className="admin-count-label">{data.total} courses</p>
          <div className="learner-course-grid">
            {data.items.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
          {!data.items.length && (
            <AdminEmpty title="No courses match your search" />
          )}
          {data.totalPages > 1 && (
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={(page) => update('page', page)}
            />
          )}
        </>
      )}
    </StudentPage>
  );
}
