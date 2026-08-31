import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Star, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${courseId}`)
      .then(data => {
        setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching course:', err);
        setLoading(false);
      });
  }, [courseId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading course details...</div>;
  }

  if (!course) {
    return <div className="p-8 text-center text-slate-500">Course not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/courses')}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{course.title}</h1>
          <p className="text-sm text-slate-500">Course ID: #{course.id}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-100 text-blue-700">
                  {course.category}
                </span>
                <h2 className="text-xl font-bold text-slate-800 mt-2">{course.title}</h2>
                {course.subtitle && <p className="text-sm text-slate-600 mt-1">{course.subtitle}</p>}
              </div>
              <StatusBadge status={course.status} />
            </div>

            {course.description && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Course Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
              </div>
            )}

            {course.modules && course.modules.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Curriculum Structure ({course.modules.length} Modules)</h3>
                <div className="space-y-3">
                  {course.modules.map((m, idx) => (
                    <div key={m.id || idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="font-semibold text-sm text-slate-800">Module {idx + 1}: {m.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{m.items?.length || 0} Lessons & Assessments</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Course Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Instructor:</span>
                <span className="font-medium text-slate-800">{course.instructor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Organization:</span>
                <span className="font-medium text-slate-800">{course.organization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Price:</span>
                <span className="font-semibold text-slate-800">${course.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Students:</span>
                <span className="font-medium text-slate-800">{(course.students || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rating:</span>
                <span className="font-medium text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {course.rating} / 5.0
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created Date:</span>
                <span className="font-medium text-slate-800">{course.createdDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
