import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const Learners = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/learners', 'admin')
      .then(data => { setLearners(Array.isArray(data) ? data : (data?.items || [])); setLoading(false); })
      .catch(err => { console.error('Error fetching learners:', err); setLearners([]); setLoading(false); });
  }, []);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Institution', accessor: 'institution' },
    { header: 'Verification', cell: (row) => <StatusBadge status={row.verificationStatus} /> },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/learners/${row.id}`);
          }}
          className="text-primary hover:text-primary-dark font-medium"
        >
          View
        </button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Learners</h1>
          <p className="text-slate-500">Manage students and their verifications.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar placeholder="Search learners..." value={searchTerm} onChange={setSearchTerm} />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterBar 
              options={[{ label: 'Active', value: 'Active' }, { label: 'Suspended', value: 'Suspended' }]} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              placeholder="All Statuses" 
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={learners} 
          onRowClick={(row) => navigate(`/admin/learners/${row.id}`)}
        />
        
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>
    </div>
  );
};
