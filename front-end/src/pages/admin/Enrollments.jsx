import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { StatCard } from '../../components/admin/StatCard';
import { Award, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { api } from '../../utils/api';

export const Enrollments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments', 'admin')
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items || []);
        setEnrollments(list);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching enrollments:', err);
        setEnrollments([]);
        setLoading(false);
      });
  }, []);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(item => {
      const learner = (item.learnerName || item.learner || '').toLowerCase();
      const course = (item.courseTitle || item.course || '').toLowerCase();
      const status = item.status || 'Active';
      const term = searchTerm.trim().toLowerCase();

      const matchesSearch = !term || learner.includes(term) || course.includes(term) || item.id?.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEnrollments.slice(start, start + pageSize);
  }, [filteredEnrollments, page, pageSize]);

  // Stat metrics
  const totalCount = enrollments.length;
  const activeCount = enrollments.filter(e => (e.status || '').toLowerCase() === 'active').length;
  const completedCount = enrollments.filter(e => (e.status || '').toLowerCase() === 'completed' || e.progress === 100).length;
  const avgProgress = totalCount > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (Number(e.progress) || 0), 0) / totalCount)
    : 0;

  const columns = [
    { 
      header: 'Learner', 
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          {row.learnerAvatar ? (
            <img src={row.learnerAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary-50 text-primary font-bold text-xs flex items-center justify-center shrink-0">
              {(row.learnerName || row.learner || 'S').charAt(0)}
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-800">{row.learnerName || row.learner || 'Student'}</div>
            {row.learnerEmail && <div className="text-[11px] text-slate-400">{row.learnerEmail}</div>}
          </div>
        </div>
      )
    },
    { 
      header: 'Course Track', 
      cell: (row) => (
        <span className="font-medium text-slate-800 max-w-[240px] truncate block">
          {row.courseTitle || row.course || 'Advanced Course Track'}
        </span>
      )
    },
    { 
      header: 'Enrollment Date', 
      cell: (row) => row.enrolledDate || row.enrollmentDate || (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent') 
    },
    { 
      header: 'Progress', 
      cell: (row) => {
        const prog = Number(row.progress) || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${prog === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                style={{ width: `${prog}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700">{prog}%</span>
          </div>
        );
      }
    },
    { 
      header: 'Status', 
      cell: (row) => <StatusBadge status={row.status || 'Active'} /> 
    },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Dropped', value: 'Dropped' },
    { label: 'Suspended', value: 'Suspended' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Enrollment Management</h1>
          <p className="text-slate-500">Live roster of student course enrollments, track completions, and progress telemetry.</p>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Enrolled Seats" value={totalCount.toString()} icon={Award} trend="up" trendValue="8.4%" color="primary" />
        <StatCard title="Active Learners" value={activeCount.toString()} icon={Users} trend="up" trendValue="12%" color="success" />
        <StatCard title="Completed Tracks" value={completedCount.toString()} icon={CheckCircle} color="purple" />
        <StatCard title="Average Progress" value={`${avgProgress}%`} icon={TrendingUp} color="warning" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar placeholder="Search by learner, course, or ID..." value={searchTerm} onChange={setSearchTerm} />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterBar 
              options={statusOptions} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              placeholder="Filter by Status" 
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading course enrollments...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={paginatedData} 
          />
        )}
        
        {!loading && filteredEnrollments.length > 0 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
};
