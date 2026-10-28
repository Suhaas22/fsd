import HumanAvatar from '../../components/common/HumanAvatar';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  BookOpen,
  Users,
  Check,
  GraduationCap,
  Search,
  Mail,
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../../components/common/Toast';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { instructors, addCourse } = useOrg();

  const [courseForm, setCourseForm] = useState({
    title: '',
    category: '',
    level: '',
    leadInstructorId: '',
    coInstructorIds: [],
    price: '',
    description: '',
    modules: [],
  });

  const [facultySearch, setFacultySearch] = useState('');

  const filteredFaculty = instructors.filter(
    (i) =>
      i.name.toLowerCase().includes(facultySearch.toLowerCase()) ||
      String(i.specialization || '')
        .toLowerCase()
        .includes(facultySearch.toLowerCase()),
  );

  const toggleCoInstructor = (instId) => {
    if (instId === courseForm.leadInstructorId) return;
    setCourseForm((prev) => {
      const exists = prev.coInstructorIds.includes(instId);
      return {
        ...prev,
        coInstructorIds: exists
          ? prev.coInstructorIds.filter((id) => id !== instId)
          : [...prev.coInstructorIds, instId],
      };
    });
  };

  const handleLeadChange = (newLeadId) => {
    setCourseForm((prev) => ({
      ...prev,
      leadInstructorId: newLeadId,
      coInstructorIds: prev.coInstructorIds.filter((id) => id !== newLeadId),
    }));
  };

  const handleAddModule = () => {
    const nextId = courseForm.modules.length + 1;
    setCourseForm({
      ...courseForm,
      modules: [
        ...courseForm.modules,
        { id: nextId, title: '', lessons: '', duration: '' },
      ],
    });
  };

  const handleRemoveModule = (id) => {
    setCourseForm({
      ...courseForm,
      modules: courseForm.modules.filter((m) => m.id !== id),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      addToast('Please enter a course title', 'error');
      return;
    }

    const leadInst = instructors.find(
      (i) => i.id === courseForm.leadInstructorId,
    );
    if (!leadInst) {
      addToast('Please select a lead instructor.', 'error');
      return;
    }

    const assignedInstructors = [
      {
        id: leadInst.id,
        name: leadInst.name,
        role: 'Lead Instructor',
        avatar: leadInst.avatar,
        specialization: leadInst.specialization,
      },
    ];

    courseForm.coInstructorIds.forEach((id) => {
      const coInst = instructors.find((i) => i.id === id);
      if (coInst) {
        assignedInstructors.push({
          id: coInst.id,
          name: coInst.name,
          role: 'Co-Instructor',
          avatar: coInst.avatar,
          specialization: coInst.specialization,
        });
      }
    });

    try {
      const created = await addCourse({
        ...courseForm,
        status: 'Pending Approval',
        instructorId: leadInst.id,
        instructors: assignedInstructors,
      });

      addToast(
        `Course "${created?.title || courseForm.title}" submitted for Admin approval.`,
        'success',
      );
      navigate('/org/courses');
    } catch (err) {
      addToast(
        `Failed to author course: ${err.message || 'Server error'}`,
        'error',
      );
    }
  };

  return (
    <OrgLayout
      breadcrumbs={[
        { label: 'Courses', path: '/org/courses' },
        { label: 'Create New Course' },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/org/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Course Catalog</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            Create New Course
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* 1. Basic Details */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 space-y-4">
            <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
              1. Basic Course Details
            </h2>
            <div>
              <label className="text-xs font-bold text-on-surface block mb-1.5">
                Course Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Distributed Consensus & High-Frequency Trading Systems"
                value={courseForm.title}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, title: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1.5">
                  Category
                </label>
                <input
                  value={courseForm.category}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, category: e.target.value })
                  }
                  className="admin-input"
                  placeholder="Course category"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1.5">
                  Skill Level
                </label>
                <select
                  required
                  value={courseForm.level}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, level: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select skill level
                  </option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1.5">
                  Price (₹ INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price in ₹"
                  required
                  value={courseForm.price}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, price: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface block mb-1.5">
                Course Summary &amp; Syllabus Overview
              </label>
              <textarea
                rows={3}
                required
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, description: e.target.value })
                }
                placeholder="Comprehensive technical breakdown of the course syllabus and hands-on lab projects..."
                className="w-full px-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
              />
            </div>
          </div>

          {/* 2. Assign Multi-Faculty Instructors */}
          <div className="border border-outline-variant rounded-3xl shadow-elevation-1 overflow-hidden">
            {/* Gradient header */}
            <div
              style={{
                background:
                  'linear-gradient(135deg, var(--md-sys-color-primary-container, #dbeafe) 0%, var(--md-sys-color-secondary-container, #ede9fe) 100%)',
              }}
              className="px-6 md:px-8 py-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/60 backdrop-blur flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-on-surface">
                    2. Assign Multi-Faculty Teaching Team
                  </h2>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Select a lead professor and optional co-instructors for this
                    course.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-white/70 backdrop-blur border border-primary/20 text-primary text-[11px] font-extrabold shadow-sm">
                {(courseForm.leadInstructorId ? 1 : 0) +
                  courseForm.coInstructorIds.length}{' '}
                Assigned
              </span>
            </div>

            <div className="bg-surface-container-lowest p-6 md:p-8 space-y-4">
              {/* Legend */}
              <div className="flex items-center gap-5 text-[10px] text-outline font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-primary inline-block" />
                  Radio = Select as Lead
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded border border-secondary/60 bg-white inline-flex items-center justify-center">
                    <Check className="w-2 h-2 text-secondary stroke-[3]" />
                  </span>
                  Checkbox = Add as Co-Instructor
                </span>
              </div>

              {/* Single search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search faculty by name or domain…"
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-on-surface font-medium transition-all"
                />
              </div>

              {/* Unified instructor list */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {filteredFaculty.length === 0 ? (
                  <div className="py-10 text-center">
                    <Search className="w-7 h-7 text-outline/30 mx-auto mb-2" />
                    <p className="text-xs text-outline">
                      No instructors match your search.
                    </p>
                  </div>
                ) : (
                  filteredFaculty.map((inst) => {
                    const isLead = inst.id === courseForm.leadInstructorId;
                    const isCo = courseForm.coInstructorIds.includes(inst.id);

                    return (
                      <div
                        key={inst.id}
                        className={`${inst.status !== 'Active' ? 'opacity-50' : ''} group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-150 select-none ${
                          isLead
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : isCo
                              ? 'border-secondary/60 bg-secondary/5 shadow-sm'
                              : 'border-outline-variant/60 bg-white hover:bg-surface-container-low hover:shadow-sm'
                        }`}
                      >
                        {/* Radio — Lead selector */}
                        <button
                          type="button"
                          disabled={inst.status !== 'Active'}
                          onClick={() => handleLeadChange(inst.id)}
                          title={
                            isLead
                              ? 'Current lead instructor'
                              : 'Set as lead instructor'
                          }
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isLead
                              ? 'border-primary'
                              : 'border-outline-variant hover:border-primary/60'
                          }`}
                        >
                          {isLead && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </button>

                        {/* Avatar with role badge */}
                        <div className="relative flex-shrink-0">
                          <HumanAvatar
                            name={inst.name}
                            className="w-10 h-10 rounded-2xl object-cover"
                          />
                          {(isLead || isCo) && (
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${isLead ? 'bg-primary' : 'bg-secondary'}`}
                            >
                              <Check className="w-2 h-2 text-white stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4
                              className={`font-bold text-xs truncate ${
                                isLead
                                  ? 'text-primary'
                                  : isCo
                                    ? 'text-secondary'
                                    : 'text-on-surface'
                              }`}
                            >
                              {inst.name}
                              {inst.status !== 'Active'
                                ? ` · ${inst.status}`
                                : ''}
                            </h4>
                            {isLead && (
                              <span className="px-1.5 py-px rounded text-[8px] font-black bg-primary text-white leading-tight flex-shrink-0">
                                LEAD
                              </span>
                            )}
                            {isCo && (
                              <span className="px-1.5 py-px rounded text-[8px] font-black bg-secondary text-white leading-tight flex-shrink-0">
                                CO
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-semibold truncate mt-px text-primary/70">
                            {inst.specialization}
                          </p>
                          {inst.email && (
                            <p className="text-[9px] text-outline truncate mt-px flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5 flex-shrink-0" />
                              {inst.email}
                            </p>
                          )}
                        </div>

                        {/* Checkbox — Co-Instructor selector */}
                        <button
                          type="button"
                          onClick={() =>
                            inst.status === 'Active' &&
                            !isLead &&
                            toggleCoInstructor(inst.id)
                          }
                          disabled={isLead || inst.status !== 'Active'}
                          title={
                            isLead
                              ? 'Already assigned as Lead'
                              : isCo
                                ? 'Remove co-instructor'
                                : 'Add as co-instructor'
                          }
                          className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                            isLead
                              ? 'border-primary/30 bg-primary/10 cursor-not-allowed'
                              : isCo
                                ? 'border-secondary bg-secondary text-white cursor-pointer'
                                : 'border-outline-variant bg-white hover:border-secondary/60 cursor-pointer'
                          }`}
                        >
                          {(isCo || isLead) && (
                            <Check
                              className={`w-3 h-3 stroke-[3] ${isLead ? 'text-primary/40' : 'text-white'}`}
                            />
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Teaching Team Preview Strip */}
              <div className="rounded-2xl border border-outline-variant/60 overflow-hidden">
                <div className="px-4 py-2.5 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/40">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">
                    Teaching Team Preview
                  </span>
                  <span className="text-[10px] text-outline">
                    {(courseForm.leadInstructorId ? 1 : 0) +
                      courseForm.coInstructorIds.length}{' '}
                    member(s)
                  </span>
                </div>
                <div className="px-4 py-3 bg-white flex items-center gap-3 flex-wrap">
                  {(() => {
                    const lead = instructors.find(
                      (i) => i.id === courseForm.leadInstructorId,
                    );
                    return lead ? (
                      <div
                        className="flex items-center gap-2 px-2.5 py-1.5 border border-primary/20 rounded-xl"
                        style={{
                          background:
                            'color-mix(in srgb, var(--md-sys-color-primary, #2563eb) 8%, white)',
                        }}
                      >
                        <HumanAvatar
                          name={lead.name}
                          className="w-6 h-6 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-[10px] font-bold text-primary leading-tight">
                            {lead.name}
                          </p>
                          <p className="text-[9px] text-outline leading-tight">
                            Lead Instructor
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  {courseForm.coInstructorIds.map((id) => {
                    const co = instructors.find((i) => i.id === id);
                    return co ? (
                      <div
                        key={id}
                        className="flex items-center gap-2 px-2.5 py-1.5 border border-secondary/20 rounded-xl"
                        style={{
                          background:
                            'color-mix(in srgb, var(--md-sys-color-secondary, #7c3aed) 8%, white)',
                        }}
                      >
                        <HumanAvatar
                          name={co.name}
                          className="w-6 h-6 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-[10px] font-bold text-secondary leading-tight">
                            {co.name}
                          </p>
                          <p className="text-[9px] text-outline leading-tight">
                            Co-Instructor
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })}
                  {!courseForm.leadInstructorId &&
                    courseForm.coInstructorIds.length === 0 && (
                      <p className="text-[10px] text-outline italic ml-1">
                        No faculty assigned yet. Select a lead instructor to
                        continue.
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Curriculum Modules */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h2 className="text-base font-bold text-on-surface">
                3. Curriculum Modules
              </h2>
              <button
                type="button"
                onClick={handleAddModule}
                className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            </div>
            <div className="space-y-3">
              {courseForm.modules.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex items-center gap-3"
                >
                  <span className="min-w-20 h-8 px-2 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 whitespace-nowrap">
                    Module {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => {
                      const updated = [...courseForm.modules];
                      updated[idx].title = e.target.value;
                      setCourseForm({ ...courseForm, modules: updated });
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-outline-variant rounded-xl focus:outline-none focus:border-primary font-medium"
                  />
                  {courseForm.modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(m.id)}
                      className="p-2 text-outline hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/org/courses')}
              className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Submit course for review</span>
            </button>
          </div>
        </form>
      </div>
    </OrgLayout>
  );
}
