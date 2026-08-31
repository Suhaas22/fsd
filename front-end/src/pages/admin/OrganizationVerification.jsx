import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ApprovalModal, RejectModal } from '../../components/admin/Modals';
import { api } from '../../utils/api';

export const OrganizationVerification = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/organizations', 'admin')
      .then(data => { setOrganizations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error('Error fetching organizations:', err); setOrganizations([]); setLoading(false); });
  }, []);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const pendingOrgs = organizations.filter(org => org.verificationStatus === 'Pending');

  const columns = [
    { header: 'Organization', accessor: 'name' },
    { header: 'Domain', accessor: 'domain' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.verificationStatus} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedOrg(row); setIsApproveModalOpen(true); }}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Approve
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedOrg(row); setIsRejectModalOpen(true); }}
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            Reject
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Organization Verification</h1>
          <p className="text-slate-500">Review and approve new organizations.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar placeholder="Search pending organizations..." value={searchTerm} onChange={setSearchTerm} />
        </div>

        <DataTable 
          columns={columns} 
          data={pendingOrgs} 
          onRowClick={(row) => navigate(`/admin/organizations/${row.id}`)}
        />
        
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>

      {selectedOrg && (
        <>
          <ApprovalModal
            isOpen={isApproveModalOpen}
            onClose={() => { setIsApproveModalOpen(false); setSelectedOrg(null); }}
            onApprove={() => console.log('Approved', selectedOrg.id)}
            title="Approve Organization"
            itemName={selectedOrg.name}
          />
          <RejectModal
            isOpen={isRejectModalOpen}
            onClose={() => { setIsRejectModalOpen(false); setSelectedOrg(null); }}
            onReject={(reason) => console.log('Rejected', selectedOrg.id, reason)}
            title="Reject Organization"
            itemName={selectedOrg.name}
          />
        </>
      )}
    </div>
  );
};
