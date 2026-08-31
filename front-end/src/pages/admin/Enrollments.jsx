import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const Enrollments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments', 'admin')
      .then(data => { setEnrollments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error('Error fetching enrollments:', err); setEnrollments([]); setLoading(false); });
  }, []);

  const columns = [
    { header: 'Learner', accessor: 'learner' },
    { header: 'Course', accessor: 'course' },
    { header: 'Instructor', accessor: 'instructor' },
    { header: 'Enrollment Date', accessor: 'enrollmentDate' },
    { header: 'Progress', cell: (row) => `${row.progress}%` },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Dropped', value: 'Dropped' },
    { label: 'Suspended', value: 'Suspended' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Enrollments</h1>
          <p className="text-slate-500">View and manage all course enrollments.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar placeholder="Search enrollments..." value={searchTerm} onChange={setSearchTerm} />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterBar 
              options={statusOptions} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              placeholder="All Statuses" 
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={enrollments} 
        />
        
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>
    </div>
  );
};
