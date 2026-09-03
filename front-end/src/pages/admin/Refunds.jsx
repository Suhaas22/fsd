import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ApprovalModal, RejectModal } from '../../components/admin/Modals';
import { api } from '../../utils/api';

export const Refunds = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = () => {
    api.get('/refunds')
      .then(data => {
        setRefunds(Array.isArray(data) ? data : (data?.items || []));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching refunds:', err);
        setLoading(false);
      });
  };

  const handleApprove = () => {
    if (!selectedRefund) return;
    api.patch(`/refunds/${selectedRefund.id}`, { status: 'Approved' })
      .then(() => {
        fetchRefunds();
        setIsApproveModalOpen(false);
        setSelectedRefund(null);
      })
      .catch(err => console.error('Error approving refund:', err));
  };

  const handleReject = (reason) => {
    if (!selectedRefund) return;
    api.patch(`/refunds/${selectedRefund.id}`, { status: 'Rejected', reason })
      .then(() => {
        fetchRefunds();
        setIsRejectModalOpen(false);
        setSelectedRefund(null);
      })
      .catch(err => console.error('Error rejecting refund:', err));
  };

  const filteredData = refunds.filter(r =>
    r.learner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Refund ID', accessor: 'id' },
    { header: 'Learner', accessor: 'learner' },
    { header: 'Course', accessor: 'course' },
    { header: 'Amount', cell: (row) => `$${row.amount}` },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Date', accessor: 'date' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        row.status === 'Pending' ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setSelectedRefund(row); setIsApproveModalOpen(true); }}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              Approve
            </button>
            <button 
              onClick={() => { setSelectedRefund(row); setIsRejectModalOpen(true); }}
              className="text-rose-600 hover:text-rose-700 font-medium text-sm"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-slate-400 text-sm italic">{row.status}</span>
        )
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Refund Requests</h1>
          <p className="text-slate-500">Manage learner refund requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar placeholder="Search refunds..." value={searchTerm} onChange={setSearchTerm} />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading refunds...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredData} 
          />
        )}
        
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>

      {selectedRefund && (
        <>
          <ApprovalModal
            isOpen={isApproveModalOpen}
            onClose={() => { setIsApproveModalOpen(false); setSelectedRefund(null); }}
            onApprove={handleApprove}
            title="Approve Refund"
            itemName={`Refund ${selectedRefund.id}`}
          />
          <RejectModal
            isOpen={isRejectModalOpen}
            onClose={() => { setIsRejectModalOpen(false); setSelectedRefund(null); }}
            onReject={handleReject}
            title="Reject Refund"
            itemName={`Refund ${selectedRefund.id}`}
          />
        </>
      )}
    </div>
  );
};
