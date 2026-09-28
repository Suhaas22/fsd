import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Coins,
  Percent,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  MapPin,
  Mail,
  ChevronDown,
  ChevronUp,
  X,
  Star,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/api';
import HumanAvatar from '../../components/common/HumanAvatar';

export default function SuperAdminOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedOrgId, setExpandedOrgId] = useState('org-101');

  // Org Modals & State
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState(null);
  const [orgForm, setOrgForm] = useState({
    name: '',
    tagline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    establishedYear: 2022,
    totalRevenue: 80000,
    status: 'Active',
  });
  const [orgToDelete, setOrgToDelete] = useState(null);

  // Instructor Modals & State (Full CRUD for Super Admin)
  const [showAddInstructorModal, setShowAddInstructorModal] = useState(false);
  const [targetOrgIdForNewInstructor, setTargetOrgIdForNewInstructor] = useState(null);
  const [newInstructorForm, setNewInstructorForm] = useState({
    name: '',
    email: '',
    role: 'Professor',
    specialization: 'Computer Science',
    department: 'Computer Science',
    rating: 4.9,
    status: 'Active',
    enrolledStudents: 60,
  });

  const [showEditInstructorModal, setShowEditInstructorModal] = useState(false);
  const [editingInstructorId, setEditingInstructorId] = useState(null);
  const [editInstructorForm, setEditInstructorForm] = useState({
    name: '',
    email: '',
    role: 'Professor',
    specialization: 'Computer Science',
    department: 'Computer Science',
    rating: 4.9,
    status: 'Active',
  });

  const [instructorToDelete, setInstructorToDelete] = useState(null);
  const [selectedInstructorDetail, setSelectedInstructorDetail] = useState(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await api.superAdmin.getOrganizations();
      const list = Array.isArray(res) ? res : res?.items || [];
      setOrganizations(list);
      if (list.length > 0 && !expandedOrgId) {
        setExpandedOrgId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Org Actions
  const handleOpenEditOrg = (org) => {
    setEditingOrgId(org.id);
    setOrgForm({
      name: org.name || '',
      tagline: org.tagline || '',
      email: org.email || '',
      phone: org.phone || '',
      location: org.location || '',
      website: org.website || '',
      establishedYear: org.establishedYear || 2022,
      totalRevenue: org.totalRevenue || 80000,
      status: org.status || 'Active',
    });
    setShowEditOrgModal(true);
  };

  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    try {
      await api.superAdmin.updateOrganization(editingOrgId, orgForm);
      setShowEditOrgModal(false);
      setEditingOrgId(null);
      fetchOrganizations();
    } catch (err) {
      alert('Error updating organization: ' + err.message);
    }
  };

  const handleConfirmDeleteOrg = async () => {
    if (!orgToDelete) return;
    try {
      await api.superAdmin.deleteOrganization(orgToDelete.id);
      setOrgToDelete(null);
      fetchOrganizations();
    } catch (err) {
      alert('Error removing organization: ' + err.message);
    }
  };

  // Instructor CRUD Actions
  const handleOpenAddInstructor = (orgId) => {
    setTargetOrgIdForNewInstructor(orgId);
    setNewInstructorForm({
      name: '',
      email: '',
      role: 'Professor',
      specialization: 'Computer Science',
      department: 'Computer Science',
      rating: 4.9,
      status: 'Active',
      enrolledStudents: 60,
    });
    setShowAddInstructorModal(true);
  };

  const handleCreateInstructor = async (e) => {
    e.preventDefault();
    try {
      await api.superAdmin.createInstructor({
        ...newInstructorForm,
        organizationId: targetOrgIdForNewInstructor,
      });
      setShowAddInstructorModal(false);
      setTargetOrgIdForNewInstructor(null);
      fetchOrganizations();
    } catch (err) {
      alert('Error adding instructor: ' + err.message);
    }
  };

  const handleOpenEditInstructor = (inst, e) => {
    if (e) e.stopPropagation();
    setEditingInstructorId(inst.id);
    setEditInstructorForm({
      name: inst.name || '',
      email: inst.email || '',
      role: inst.role || inst.educatorType || 'Professor',
      specialization: inst.specialization || 'Computer Science',
      department: inst.department || inst.specialization || 'Computer Science',
      rating: inst.avgRating || inst.rating || 4.9,
      status: inst.status || 'Active',
    });
    setShowEditInstructorModal(true);
  };

  const handleUpdateInstructor = async (e) => {
    e.preventDefault();
    try {
      await api.superAdmin.updateInstructor(editingInstructorId, editInstructorForm);
      setShowEditInstructorModal(false);
      setEditingInstructorId(null);
      if (selectedInstructorDetail && selectedInstructorDetail.id === editingInstructorId) {
        setSelectedInstructorDetail({ ...selectedInstructorDetail, ...editInstructorForm });
      }
      fetchOrganizations();
    } catch (err) {
      alert('Error updating instructor: ' + err.message);
    }
  };

  const handleOpenDeleteInstructor = (inst, e) => {
    if (e) e.stopPropagation();
    setInstructorToDelete(inst);
  };

  const handleConfirmDeleteInstructor = async () => {
    if (!instructorToDelete) return;
    try {
      await api.superAdmin.deleteInstructor(instructorToDelete.id);
      if (selectedInstructorDetail && selectedInstructorDetail.id === instructorToDelete.id) {
        setSelectedInstructorDetail(null);
      }
      setInstructorToDelete(null);
      fetchOrganizations();
    } catch (err) {
      alert('Error removing instructor: ' + err.message);
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrgId(expandedOrgId === id ? null : id);
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.location?.toLowerCase().includes(search.toLowerCase())
  );

  // Overall Totals directly from JSON data
  const totalGross = organizations.reduce((sum, o) => sum + (Number(o.totalRevenue) || 0), 0);
  const totalOrgShare = Math.round(totalGross * 0.85);
  const totalSuperAdminShare = Math.round(totalGross * 0.15);

  return (
    <div className="space-y-6 pb-12">
      {/* Coursera-style Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0056D2] text-white flex items-center justify-center font-black shadow-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organizations</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0056D2] text-[10px] font-bold border border-blue-200">
              {organizations.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accredited academic institutions, faculty instructor rosters, courses taught, and contractual revenue allocation.
          </p>
        </div>
      </div>

      {/* Aggregate Financial Metrics (Clean Notion Cards, Subtle 85/15) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Institutional Volume</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalGross.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Cumulative across {organizations.length} organizations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Organization Disbursals</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">85%</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalOrgShare.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Total institutional payout share</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Platform Margin</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">15%</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{totalSuperAdminShare.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Platform governance and maintenance commission</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search organizations by name, email, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
        />
      </div>

      {/* Organizations List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          Loading institutional records and faculty partner rosters...
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          No organizations found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrgs.map((org) => {
            const isExpanded = expandedOrgId === org.id;
            const gross = Number(org.totalRevenue) || 100000;
            const orgShare = Math.round(gross * 0.85);
            const superAdminShare = Math.round(gross * 0.15);
            const instructorsList = org.instructors || [];

            return (
              <div
                key={org.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all duration-200"
              >
                {/* Organization Header Bar */}
                <div
                  onClick={() => toggleExpand(org.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <img
                      src={org.logo || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-12 h-12 rounded-xl border border-slate-200 object-cover shrink-0 shadow-2xs"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{org.name}</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
                          {org.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {org.status || 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{org.tagline}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{org.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{org.email}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-500" />
                          <strong className="text-slate-700">{instructorsList.length} Instructors</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Snapshot & Controls */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Revenue</p>
                      <p className="text-sm font-black text-slate-900">₹{gross.toLocaleString()}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                        <span>Org: ₹{orgShare.toLocaleString()}</span>
                        <span>•</span>
                        <span>Fee: ₹{superAdminShare.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Org Action Buttons (Edit & Delete Org) */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditOrg(org)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Organization"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setOrgToDelete(org)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Organization"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div
                        onClick={() => toggleExpand(org.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* EXPANDED SECTION */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-5 animate-in fade-in duration-200">
                    {/* Subtle 85% / 15% Summary Card */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Revenue Contract Split</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                            85% Org / 15% Platform
                          </span>
                        </div>
                        <span className="text-slate-500 text-[11px]">Institution: {org.name}</span>
                      </div>

                      {/* Subtle Split Bar */}
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="bg-slate-700 h-full w-[85%]" title="85% to Organization"></div>
                        <div className="bg-indigo-500 h-full w-[15%]" title="15% to Platform"></div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-center text-xs">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Gross</p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">₹{gross.toLocaleString()}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">85% to {org.name}</p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">₹{orgShare.toLocaleString()}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <p className="text-[10px] text-slate-500 uppercase font-semibold">15% Platform Margin</p>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">₹{superAdminShare.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Instructors Section Header with Add Instructor Button */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-slate-600" />
                            <span>Instructors Roster ({instructorsList.length})</span>
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Faculty members teaching under {org.name}
                          </p>
                        </div>

                        {/* Super Admin CRUD: Add Instructor to this Org */}
                        <button
                          onClick={() => handleOpenAddInstructor(org.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Instructor</span>
                        </button>
                      </div>

                      {/* Instructors Grid */}
                      {instructorsList.length === 0 ? (
                        <div className="p-6 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                          No instructors currently assigned to this organization. Click "Add Instructor" to assign one.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {instructorsList.map((inst) => {
                            const teachingCourses = inst.teachingCourses || [];
                            const totalEnrolled = inst.totalEnrolledStudents || inst.enrolledStudents || 120;

                            return (
                              <div
                                key={inst.id}
                                onClick={() => setSelectedInstructorDetail({ ...inst, orgName: org.name, orgId: org.id })}
                                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                              >
                                <div>
                                  {/* Instructor Top Info */}
                                  <div className="flex items-center gap-3">
                                    <HumanAvatar name={inst.name} size="sm" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#0056D2] transition-colors truncate">{inst.name}</p>
                                      <p className="text-[10px] text-slate-500 truncate">{inst.role || inst.educatorType || 'Instructor'}</p>
                                      <p className="text-[10px] text-slate-400 font-mono truncate">{inst.email}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-amber-600 font-bold text-xs flex items-center gap-0.5 justify-end">
                                        ★ {inst.avgRating || inst.rating || 4.8}
                                      </span>
                                      <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 block mt-1">
                                        {totalEnrolled} Enrolled
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-2">
                                    <span className="inline-block text-[10px] text-slate-600 font-semibold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md truncate w-full">
                                      {inst.specialization}
                                    </span>
                                  </div>

                                  {/* Courses taught */}
                                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Courses ({teachingCourses.length})
                                    </span>

                                    <div className="space-y-1 max-h-28 overflow-y-auto pr-0.5 custom-scrollbar">
                                      {teachingCourses.length > 0 ? (
                                        teachingCourses.map((tc, tcIdx) => (
                                          <div
                                            key={tc.id || tcIdx}
                                            className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] flex items-center justify-between gap-2"
                                          >
                                            <p className="font-semibold text-slate-700 truncate">{tc.title}</p>
                                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-bold shrink-0">
                                              {tc.enrolledCount} enrolled
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] flex items-center justify-between gap-2 text-slate-500">
                                          <span>Core Modules</span>
                                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-bold shrink-0">
                                            {totalEnrolled} enrolled
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Instructor Actions (Edit & Delete CRUD) */}
                                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 mt-1" onClick={(e) => e.stopPropagation()}>
                                  <span className="font-mono text-[10px] text-slate-500">{inst.id}</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => handleOpenEditInstructor(inst, e)}
                                      className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                      title="Edit Instructor"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => handleOpenDeleteInstructor(inst, e)}
                                      className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Delete Instructor"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ADD INSTRUCTOR MODAL (SUPER ADMIN CRUD) */}
      {/* ────────────────────────────────────────────────────────── */}
      {showAddInstructorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Instructor to Organization</h2>
              <button
                onClick={() => setShowAddInstructorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInstructor} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Eleanor Vance"
                  value={newInstructorForm.name}
                  onChange={(e) => setNewInstructorForm({ ...newInstructorForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. eleanor.vance@institution.edu"
                  value={newInstructorForm.email}
                  onChange={(e) => setNewInstructorForm({ ...newInstructorForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Academic Role</label>
                  <select
                    value={newInstructorForm.role}
                    onChange={(e) => setNewInstructorForm({ ...newInstructorForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Distinguished Lecturer">Distinguished Lecturer</option>
                    <option value="Lead Researcher">Lead Researcher</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={newInstructorForm.rating}
                    onChange={(e) => setNewInstructorForm({ ...newInstructorForm, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Specialization / Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & Cloud Infrastructure"
                  value={newInstructorForm.specialization}
                  onChange={(e) => setNewInstructorForm({ ...newInstructorForm, specialization: e.target.value, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddInstructorModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Add Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 2: EDIT INSTRUCTOR MODAL (SUPER ADMIN CRUD) */}
      {/* ────────────────────────────────────────────────────────── */}
      {showEditInstructorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Edit Instructor Details</h2>
              <button
                onClick={() => setShowEditInstructorModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateInstructor} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editInstructorForm.name}
                  onChange={(e) => setEditInstructorForm({ ...editInstructorForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editInstructorForm.email}
                  onChange={(e) => setEditInstructorForm({ ...editInstructorForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Academic Role</label>
                  <select
                    value={editInstructorForm.role}
                    onChange={(e) => setEditInstructorForm({ ...editInstructorForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Distinguished Lecturer">Distinguished Lecturer</option>
                    <option value="Lead Researcher">Lead Researcher</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={editInstructorForm.rating}
                    onChange={(e) => setEditInstructorForm({ ...editInstructorForm, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Specialization / Department</label>
                <input
                  type="text"
                  required
                  value={editInstructorForm.specialization}
                  onChange={(e) => setEditInstructorForm({ ...editInstructorForm, specialization: e.target.value, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Status</label>
                <select
                  value={editInstructorForm.status}
                  onChange={(e) => setEditInstructorForm({ ...editInstructorForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditInstructorModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 3: DELETE INSTRUCTOR CONFIRMATION MODAL */}
      {/* ────────────────────────────────────────────────────────── */}
      {instructorToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Instructor?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900">{instructorToDelete.name}</strong>? This will remove them from this organization's faculty roster.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setInstructorToDelete(null)}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteInstructor}
                className="py-2 px-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 4: INSTRUCTOR DETAIL DRAWER / MODAL */}
      {/* ────────────────────────────────────────────────────────── */}
      {selectedInstructorDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <HumanAvatar name={selectedInstructorDetail.name} size="lg" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedInstructorDetail.name}</h3>
                  <p className="text-xs text-slate-500">{selectedInstructorDetail.role || 'Faculty Member'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedInstructorDetail.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInstructorDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Organization:</span>
                <span className="font-semibold text-slate-900">{selectedInstructorDetail.orgName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Specialization:</span>
                <span className="font-semibold text-slate-900">{selectedInstructorDetail.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rating:</span>
                <span className="font-bold text-amber-600">★ {selectedInstructorDetail.avgRating || selectedInstructorDetail.rating || 4.9}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-slate-900">{selectedInstructorDetail.status || 'Active'}</span>
              </div>
            </div>

            {/* Direct CRUD actions right inside detail modal */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const inst = selectedInstructorDetail;
                  setSelectedInstructorDetail(null);
                  handleOpenEditInstructor(inst);
                }}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Instructor</span>
              </button>
              <button
                onClick={() => {
                  const inst = selectedInstructorDetail;
                  setSelectedInstructorDetail(null);
                  setInstructorToDelete(inst);
                }}
                className="py-2 px-3 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Instructor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 5: EDIT ORGANIZATION MODAL */}
      {/* ────────────────────────────────────────────────────────── */}
      {showEditOrgModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Edit Organization</h2>
              <button
                onClick={() => setShowEditOrgModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateOrg} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={orgForm.tagline}
                  onChange={(e) => setOrgForm({ ...orgForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={orgForm.email}
                    onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={orgForm.location}
                    onChange={(e) => setOrgForm({ ...orgForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditOrgModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 6: DELETE ORGANIZATION CONFIRMATION MODAL */}
      {/* ────────────────────────────────────────────────────────── */}
      {orgToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Organization?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900">{orgToDelete.name}</strong>? All associated records and disbursals will be decommissioned.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setOrgToDelete(null)}
                className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteOrg}
                className="py-2 px-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
