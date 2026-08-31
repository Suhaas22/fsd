import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, GraduationCap, Building2 } from 'lucide-react';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { UserAvatar } from '../../components/admin/UserAvatar';
import { api } from '../../utils/api';

export const LearnerDetails = () => {
  const { learnerId } = useParams();
  const navigate = useNavigate();
  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/learners/${learnerId}`)
      .then(data => {
        setLearner(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching learner:', err);
        setLoading(false);
      });
  }, [learnerId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading learner details...</div>;
  }

  if (!learner) {
    return <div className="p-8 text-center text-slate-500">Learner not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/learners')}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{learner.name}</h1>
          <p className="text-sm text-slate-500">Learner ID: #{learner.id}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
          <UserAvatar name={learner.name} size="xl" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800">{learner.name}</h2>
              <StatusBadge status={learner.status} />
              <StatusBadge status={learner.verificationStatus} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {learner.email}</span>
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {learner.institution}</span>
              <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> {learner.degree}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Academic Profile</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Student ID: </span>
                <span className="font-medium text-slate-800">{learner.studentId}</span>
              </div>
              <div>
                <span className="text-slate-500">Institution: </span>
                <span className="font-medium text-slate-800">{learner.institution}</span>
              </div>
              <div>
                <span className="text-slate-500">Degree / Major: </span>
                <span className="font-medium text-slate-800">{learner.degree}</span>
              </div>
              <div>
                <span className="text-slate-500">Graduation Year: </span>
                <span className="font-medium text-slate-800">{learner.graduationYear}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
