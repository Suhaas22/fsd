import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates', 'admin')
      .then(data => { setCertificates(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error('Error fetching certificates:', err); setCertificates([]); setLoading(false); });
  }, []);

  const columns = [
    { header: 'Certificate ID', accessor: 'id' },
    { header: 'Learner', accessor: 'learner' },
    { header: 'Course', accessor: 'course' },
    { header: 'Issued Date', accessor: 'issuedDate' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: () => (
        <div className="flex items-center gap-3">
          <button className="text-primary hover:text-primary-dark font-medium">View</button>
          <button className="text-rose-600 hover:text-rose-700 font-medium">Revoke</button>
        </div>
      )
    },
  ];

  const filteredData = certificates.filter(c => 
    c.learner?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Certificates</h1>
          <p className="text-slate-500">Manage all platform issued certificates.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar placeholder="Search certificates..." value={searchTerm} onChange={setSearchTerm} />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading certificates...</div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>
    </div>
  );
};
