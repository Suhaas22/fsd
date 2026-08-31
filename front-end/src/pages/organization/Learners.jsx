import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Download,
  Mail,
  Award,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';
import { exportToCSV } from '../../utils/csvDownload';

export default function Learners() {
  const { learners } = useOrg();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredLearners = learners.filter(l => {
    const matchesFilter = filter === 'All' || l.learnerType.includes(filter);
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
                          l.email.toLowerCase().includes(search.toLowerCase()) ||
                          l.university.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Learner ID', 'Name', 'Email', 'University', 'Cohort Type', 'Enrolled Courses', 'Average Progress (%)', 'Certificates'];
    const rows = filteredLearners.map(l => [
      l.id,
      l.name,
      l.email,
      l.university,
      l.learnerType,
      l.enrolledCourses,
      l.overallProgress,
      l.certificatesEarned
    ]);

    exportToCSV('learners_roster.csv', headers, rows);
    addToast('Downloaded learners roster CSV file!', 'success');
  };

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Learners' }]}
      actions={
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all border border-outline-variant"
        >
          <Download className="w-4 h-4 text-primary" />
          <span>Export Student CSV</span>
        </button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Enrolled Students & Cohorts</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Managing {learners.length} active university and corporate learners.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-xs font-bold text-on-surface">
              Total Learners: {learners.length}
            </span>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 shadow-elevation-1 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Undergraduate', 'Postgraduate', 'Corporate'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  filter === tab
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students by name, email, university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
            />
          </div>
        </div>

        {/* Learners Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">Learner</th>
                  <th className="pb-3 font-bold">University / Department</th>
                  <th className="pb-3 font-bold">Enrolled Courses</th>
                  <th className="pb-3 font-bold">Avg Progress</th>
                  <th className="pb-3 font-bold">Certificates</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredLearners.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={l.avatar} alt={l.name} className="w-10 h-10 rounded-2xl object-cover" />
                        <div>
                          <p className="font-bold text-sm text-on-surface">{l.name}</p>
                          <span className="text-[11px] text-outline flex items-center gap-1">
                            <Mail className="w-3 h-3 text-primary" /> {l.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-semibold text-on-surface block">{l.university}</span>
                      <span className="text-[11px] text-outline">{l.learnerType}</span>
                    </td>
                    <td className="py-4 font-bold text-on-surface">{l.enrolledCourses} courses</td>
                    <td className="py-4 font-bold text-emerald-700">{l.overallProgress}%</td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold inline-flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" />
                        {l.certificatesEarned}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        to={`/learners/${l.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </OrgLayout>
  );
}
