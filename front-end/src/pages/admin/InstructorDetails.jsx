import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, BookOpen, Building2, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { UserAvatar } from '../../components/admin/UserAvatar';
import { api } from '../../utils/api';

export const InstructorDetails = () => {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/instructors/${instructorId}`)
      .then(data => {
        setInstructor(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching instructor:', err);
        setLoading(false);
      });
  }, [instructorId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading instructor details...</div>;
  }

  if (!instructor) {
    return <div className="p-8 text-center text-slate-500">Instructor not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/instructors')}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{instructor.name}</h1>
          <p className="text-sm text-slate-500">Instructor ID: #{instructor.id}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
          <UserAvatar name={instructor.name} size="xl" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800">{instructor.name}</h2>
              <StatusBadge status={instructor.status} />
              <StatusBadge status={instructor.verificationStatus} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {instructor.email}</span>
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {instructor.organization}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {instructor.courses} Courses</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Academic & Professional Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Expertise: </span>
                <span className="font-medium text-slate-800">{instructor.expertise}</span>
              </div>
              <div>
                <span className="text-slate-500">Qualification: </span>
                <span className="font-medium text-slate-800">{instructor.qualification}</span>
              </div>
              <div>
                <span className="text-slate-500">Affiliated Organization: </span>
                <span className="font-medium text-slate-800">{instructor.organization}</span>
              </div>
            </div>
          </div>
          {instructor.bio && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-base">Bio</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{instructor.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
