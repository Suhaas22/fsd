import HumanAvatar from '../../components/common/HumanAvatar';
import SearchableSelect from '../../components/common/SearchableSelect';
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, GraduationCap, Check } from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../../components/common/Toast';
import { useRemoteData } from '../../hooks/useRemoteData';
import { AdminDataState, AdminEmpty } from '../../components/admin/AdminUI';

export default function EditCourse() {
  const { id } = useParams();
  const state = useRemoteData(`/courses/${id}/organization`);
  const org = useOrg();
  if (state.loading || org.isLoading || state.error || org.error || !state.data)
    return (
      <OrgLayout>
        <div className="admin-page">
          <AdminDataState
            loading={state.loading || org.isLoading}
            error={state.error || org.error}
            refresh={state.refresh}
          />
          <Link className="admin-button" to="/org/courses">
            Back to courses
          </Link>
        </div>
      </OrgLayout>
    );
  if (state.data.status === 'Archived')
    return (
      <OrgLayout>
        <div className="admin-page">
          <AdminEmpty
            title="This course is archived"
            description="This course is no longer in the current course list."
          />
          <Link className="admin-button" to="/org/courses">
            Back to courses
          </Link>
        </div>
      </OrgLayout>
    );
  return <CourseEditor key={id} course={state.data} />;
}
function CourseEditor({ course }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { updateCourse, instructors: faculty } = useOrg();
  const instructors = faculty.filter(
    (i) => i.organizationId === course.organizationId
  );

  // Determine existing lead and co-instructor IDs
  const initialLeadId =
    course.instructorId || course.instructors?.[0]?.id || '';
  const initialCoIds = (course?.instructors || [])
    .filter((i) => i.role === 'Co-Instructor' || i.id !== initialLeadId)
    .map((i) => i.id);

  const [courseForm, setCourseForm] = useState({
    title: course?.title || '',
    category: course?.category || '',
    level: course?.level || '',
    price: course.price == null ? '' : String(course.price),
    description: course?.description || '',
    leadInstructorId: initialLeadId,
    coInstructorIds: initialCoIds,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (course) {
      const leadInst = instructors.find(
        (i) => i.id === courseForm.leadInstructorId
      );
      if (!leadInst) {
        addToast('Choose an active instructor from your institute.', 'error');
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
        await updateCourse(course.id, {
          ...courseForm,
          instructors: assignedInstructors,
          instructorId: leadInst.id,
          instructorName: assignedInstructors.map((i) => i.name).join(', '),
        });

        addToast(
          `Course "${courseForm.title}" saved with ${assignedInstructors.length} assigned instructors.`,
          'success'
        );
        navigate('/org/courses');
      } catch (err) {
        addToast(
          `Failed to update course: ${err.message || 'Server error'}`,
          'error'
        );
      }
    }
  };

  if (!course) {
    return (
      <OrgLayout
        breadcrumbs={[
          { label: 'Courses', path: '/org/courses' },
          { label: 'Edit' },
        ]}
      >
        <div className="p-8 text-center">
          <p className="text-sm font-bold text-on-surface">Course not found</p>
          <Link
            to="/org/courses"
            className="text-xs text-primary font-bold hover:underline mt-2 inline-block"
          >
            Return to Courses
          </Link>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout
      breadcrumbs={[
        { label: 'Courses', path: '/org/courses' },
        { label: `Edit: ${course.title}` },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/org/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              Edit Course: {course.title}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Modify curriculum syllabus, multi-faculty assignments, and pricing
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 space-y-5"
        >
          <div>
            <label className="text-xs font-bold text-on-surface block mb-1.5">
              Course Title
            </label>
            <input
              type="text"
              required
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
                Level
              </label>
              <select
                value={courseForm.level}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, level: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
              >
                <option value="">Select level</option>
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
                min="0"
                required
                value={courseForm.price}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, price: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
              />
            </div>
          </div>

          {/* Multi-Faculty Teaching Team */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/60">
              <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>Assigned teaching team</span>
              </h2>
              <span className="text-xs font-bold text-primary">
                {1 + courseForm.coInstructorIds.length} Instructor(s)
              </span>
            </div>

            <p className="text-[11px] text-outline">
              Selected instructors receive course access when you save.
            </p>

            <div>
              <SearchableSelect
                label="Lead instructor"
                value={courseForm.leadInstructorId}
                onChange={handleLeadChange}
                placeholder="Choose an instructor"
                searchPlaceholder="Search instructor name or email…"
                options={instructors.map((inst) => ({
                  value: inst.id,
                  label: inst.name,
                  detail: `${inst.email || ''} · ${inst.status !== 'Active' ? inst.status : inst.specialization || 'Active'}`,
                  disabled: inst.status !== 'Active',
                }))}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface block mb-2">
                Co-Instructors
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {instructors.map((inst) => {
                  const isLead = inst.id === courseForm.leadInstructorId;
                  const isCo = courseForm.coInstructorIds.includes(inst.id);
                  const isAssigned = isLead || isCo;

                  return (
                    <div
                      key={inst.id}
                      aria-disabled={inst.status !== 'Active'}
                      onClick={() =>
                        inst.status === 'Active' &&
                        !isLead &&
                        toggleCoInstructor(inst.id)
                      }
                      className={`${inst.status !== 'Active' ? 'opacity-50 cursor-not-allowed' : ''} p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 select-none ${
                        isLead
                          ? 'border-primary/50 bg-primary/10 cursor-default'
                          : isCo
                            ? 'border-secondary/50 bg-secondary/10 cursor-pointer ring-1 ring-secondary/30'
                            : 'border-outline-variant bg-white hover:bg-surface-container cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <HumanAvatar
                          name={inst.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="font-bold text-xs text-on-surface">
                              {inst.name}
                            </h4>
                            {isLead && (
                              <span className="text-[9px] font-bold text-primary">
                                (Lead)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-outline">
                            {inst.specialization}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          isLead
                            ? 'bg-primary border-primary text-white'
                            : isCo
                              ? 'bg-secondary border-secondary text-white'
                              : 'border-outline-variant bg-white'
                        }`}
                      >
                        {isAssigned && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface block mb-1.5">
              Course Summary
            </label>
            <textarea
              rows={4}
              required
              value={courseForm.description}
              onChange={(e) =>
                setCourseForm({ ...courseForm, description: e.target.value })
              }
              className="w-full px-4 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={() => navigate('/org/courses')}
              className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Course</span>
            </button>
          </div>
        </form>
      </div>
    </OrgLayout>
  );
}
