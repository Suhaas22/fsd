import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { UserAvatar } from '../../components/admin/UserAvatar';
import { api } from '../../utils/api';

export const Users = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users', 'admin')
      .then(data => {
        // backend returns { items: [...] } after api client unwraps data wrapper
        setUsers(Array.isArray(data) ? data : (data?.items || []));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setUsers([]);
        setLoading(false);
      });
  }, []);

  // Calculate counts for display cards
  const stats = useMemo(() => {
    const total = users.length;
    const learners = users.filter(u => u.role === 'Learner').length;
    const instructors = users.filter(u => u.role === 'Instructor').length;
    const organizations = users.filter(u => u.role === 'Organization').length;
    return { total, learners, instructors, organizations };
  }, [users]);

  // Filters logic
  const filteredData = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchLower) || 
        user.email?.toLowerCase().includes(searchLower) ||
        user.institution?.toLowerCase().includes(searchLower) ||
        user.expertise?.toLowerCase().includes(searchLower) ||
        user.organization?.toLowerCase().includes(searchLower) ||
        user.domain?.toLowerCase().includes(searchLower);

      const matchesRole = roleFilter ? user.role === roleFilter : true;
      const matchesStatus = statusFilter ? user.status === statusFilter : true;
      const matchesVerification = verificationFilter ? user.verificationStatus === verificationFilter : true;

      return matchesSearch && matchesRole && matchesStatus && matchesVerification;
    });
  }, [users, searchTerm, roleFilter, statusFilter, verificationFilter]);

  const roleOptions = [
    { label: 'Learner', value: 'Learner' },
    { label: 'Instructor', value: 'Instructor' },
    { label: 'Organization', value: 'Organization' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Suspended', value: 'Suspended' },
  ];

  const verificationOptions = [
    { label: 'Verified', value: 'Verified' },
    { label: 'Pending', value: 'Pending' },
  ];

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setVerificationFilter('');
    setPage(1);
  };

  // Helper for role badge with specific styling
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'Learner':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5" />
            Learner
          </span>
        );
      case 'Instructor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5" />
            Instructor
          </span>
        );
      case 'Organization':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Building2 className="w-3.5 h-3.5" />
            Organization
          </span>
        );
      default:
        return <span className="text-xs text-slate-600 font-medium">{role}</span>;
    }
  };

  // Render role-specific affiliation info
  const renderAffiliation = (user) => {
    if (user.role === 'Learner') {
      return (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{user.institution || 'Individual Student'}</p>
          {user.degree && <p className="text-slate-500">{user.degree}</p>}
        </div>
      );
    }
    if (user.role === 'Instructor') {
      return (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{user.expertise || 'General Educator'}</p>
          {user.organization && <p className="text-slate-500">{user.organization}</p>}
        </div>
      );
    }
    if (user.role === 'Organization') {
      return (
        <div className="text-xs">
          <p className="font-medium text-slate-800">{user.domain || '-'}</p>
          <p className="text-slate-500">{user.type || 'Partner'}</p>
        </div>
      );
    }
    return <span className="text-xs text-slate-500 font-medium">-</span>;
  };

  const columns = [
    { 
      header: 'User', 
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.name} size="sm" />
          <div>
            <div className="font-semibold text-slate-800 hover:text-primary transition-colors">
              {row.name}
            </div>
            <div className="text-xs text-slate-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'Role', 
      cell: (row) => renderRoleBadge(row.role)
    },
    { 
      header: 'Affiliation / Info', 
      cell: (row) => renderAffiliation(row)
    },
    { 
      header: 'Verification', 
      cell: (row) => (
        row.verificationStatus ? (
          <StatusBadge status={row.verificationStatus} />
        ) : (
          <span className="text-xs text-slate-400">N/A</span>
        )
      )
    },
    { 
      header: 'Status', 
      cell: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      header: 'Created', 
      accessor: 'createdAt' 
    },
    { 
      header: 'Last Login', 
      accessor: 'lastLogin' 
    },
    { 
      header: 'Actions', 
      cell: (row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/users/${row.id}`);
          }}
          className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-medium text-sm hover:underline"
        >
          <span>View</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      )
    },
  ];

  const hasActiveFilters = searchTerm || roleFilter || statusFilter || verificationFilter;

  return (
    <div className="space-y-6">
      {/* Page Header without Add User button */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage all learners, instructors, and partner organizations.
        </p>
      </div>

      {/* Static Role Overview Metric Cards (Disabled clicking / filtering) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">All Users</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{stats.total}</div>
          <p className="text-xs text-slate-500 mt-1">Platform-wide accounts</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Learners</span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{stats.learners}</div>
          <p className="text-xs text-slate-500 mt-1">Students & Enrollees</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Instructors</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{stats.instructors}</div>
          <p className="text-xs text-slate-500 mt-1">Educators & Mentors</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Organizations</span>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{stats.organizations}</div>
          <p className="text-xs text-slate-500 mt-1">Partners & Universities</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-50/50">
          <div className="flex-1 max-w-md">
            <SearchBar 
              placeholder="Search by name, email, institution, org, or expertise..." 
              value={searchTerm} 
              onChange={setSearchTerm} 
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <FilterBar 
              options={roleOptions} 
              value={roleFilter} 
              onChange={setRoleFilter} 
              placeholder="All Roles" 
            />
            <FilterBar 
              options={statusOptions} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              placeholder="All Statuses" 
            />
            <FilterBar 
              options={verificationOptions} 
              value={verificationFilter} 
              onChange={setVerificationFilter} 
              placeholder="All Verifications" 
            />

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* User Table */}
        <DataTable 
          columns={columns} 
          data={filteredData} 
          onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
        />
        
        {/* Pagination & Summary */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{filteredData.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{users.length}</span> total users
            {roleFilter && (
              <span className="ml-1 text-slate-400">
                (filtered by <span className="text-primary font-medium">{roleFilter}</span>)
              </span>
            )}
          </div>
          <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
};
