import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ApprovalModal, RejectModal } from '../../components/admin/Modals';
import { api } from '../../utils/api';

export const CourseApproval = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses', 'admin')
      .then(data => { setCourses(Array.isArray(data) ? data : (data?.items || [])); setLoading(false); })
      .catch(err => { console.error('Error fetching courses:', err); setCourses([]); setLoading(false); });
  }, []);

  const pendingCourses = courses.filter(course => course.status === 'Pending Approval');

  const columns = [
    { header: 'Course', accessor: 'title' },
    { header: 'Organization', accessor: 'organization' },
    { header: 'Submitted Date', accessor: 'createdDate' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedCourse(row); setIsApproveModalOpen(true); }}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Approve
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedCourse(row); setIsRejectModalOpen(true); }}
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
          <h1 className="text-2xl font-bold text-slate-800">Course Approval</h1>
          <p className="text-slate-500">Review and approve newly submitted courses.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar placeholder="Search pending courses..." value={searchTerm} onChange={setSearchTerm} />
        </div>

        <DataTable 
          columns={columns} 
          data={pendingCourses} 
          onRowClick={(row) => navigate(`/admin/courses/${row.id}`)}
        />
        
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>

      {selectedCourse && (
        <>
          <ApprovalModal
            isOpen={isApproveModalOpen}
            onClose={() => { setIsApproveModalOpen(false); setSelectedCourse(null); }}
            onApprove={() => console.log('Approved', selectedCourse.id)}
            title="Approve Course"
            itemName={selectedCourse.title}
          />
          <RejectModal
            isOpen={isRejectModalOpen}
            onClose={() => { setIsRejectModalOpen(false); setSelectedCourse(null); }}
            onReject={(reason) => console.log('Rejected', selectedCourse.id, reason)}
            title="Reject Course"
            itemName={selectedCourse.title}
          />
        </>
      )}
    </div>
  );
};
