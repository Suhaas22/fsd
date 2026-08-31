import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const Courses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses', 'admin')
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching courses:', err);
        setCourses([]);
        setLoading(false);
      });
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? course.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Course', accessor: 'title' },
    { header: 'Organization', accessor: 'organization' },
    { header: 'Category', accessor: 'category' },
    { header: 'Price', cell: (row) => `$${row.price}` },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { 
      header: 'Actions', 
      cell: (row) => (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/courses/${row.id}`);
          }}
          className="text-primary hover:text-primary-dark font-medium"
        >
          View
        </button>
      )
    },
  ];

  const statusOptions = [
    { label: 'Published', value: 'Published' },
    { label: 'Pending Approval', value: 'Pending Approval' },
    { label: 'Draft', value: 'Draft' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
          <p className="text-slate-500">Manage all courses on the platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar placeholder="Search courses..." value={searchTerm} onChange={setSearchTerm} />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterBar 
              options={statusOptions} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              placeholder="All Statuses" 
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading courses...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredCourses} 
            onRowClick={(row) => navigate(`/admin/courses/${row.id}`)}
          />
        )}
        
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>
    </div>
  );
};
