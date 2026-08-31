import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const Organizations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/organizations', 'admin')
      .then(data => { setOrganizations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error('Error fetching organizations:', err); setOrganizations([]); setLoading(false); });
  }, []);

  const columns = [
    { header: 'Organization', accessor: 'name' },
    { header: 'Domain', accessor: 'domain' },
    { header: 'Type', accessor: 'type' },
    { header: 'Verification', cell: (row) => <StatusBadge status={row.verificationStatus} /> },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/organizations/${row.id}`);
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
          <h1 className="text-2xl font-bold text-slate-800">Organizations</h1>
          <p className="text-slate-500">Manage university and corporate partners.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar placeholder="Search organizations..." value={searchTerm} onChange={setSearchTerm} />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterBar 
              options={[{ label: 'Verified', value: 'Verified' }, { label: 'Pending', value: 'Pending' }]} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              placeholder="All Verification" 
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={organizations} 
          onRowClick={(row) => navigate(`/admin/organizations/${row.id}`)}
        />
        
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>
    </div>
  );
};
