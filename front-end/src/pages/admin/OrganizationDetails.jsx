import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Globe, Users, BookOpen } from 'lucide-react';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const OrganizationDetails = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/organizations/${organizationId}`)
      .then(data => {
        setOrg(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching organization:', err);
        setLoading(false);
      });
  }, [organizationId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading organization details...</div>;
  }

  if (!org) {
    return <div className="p-8 text-center text-slate-500">Organization not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/organizations')}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{org.name}</h1>
          <p className="text-sm text-slate-500">Organization ID: #{org.id}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800">{org.name}</h2>
              <StatusBadge status={org.status} />
              <StatusBadge status={org.verificationStatus} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {org.domain}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {org.instructors} Instructors</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {org.courses} Courses</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Organization Overview</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Type: </span>
                <span className="font-medium text-slate-800">{org.type}</span>
              </div>
              <div>
                <span className="text-slate-500">Official Domain: </span>
                <span className="font-medium text-slate-800">{org.domain}</span>
              </div>
              <div>
                <span className="text-slate-500">Sponsored Learners: </span>
                <span className="font-medium text-slate-800">{(org.learners || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
