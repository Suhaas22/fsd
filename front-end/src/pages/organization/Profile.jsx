import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Globe,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';

export default function Profile() {
  const { info, updateOrgInfo, stats } = useOrg();
  const { addToast } = useToast();

  const [form, setForm] = useState({ ...info });

  React.useEffect(() => {
    if (info) {
      setForm({ ...info });
    }
  }, [info]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateOrgInfo(form);
      addToast('Organization profile information updated in backend JSON database!', 'success');
    } catch (err) {
      addToast(`Failed to update profile: ${err.message || 'Server error'}`, 'error');
    }
  };

  return (
    <OrgLayout breadcrumbs={[{ label: 'Organization Profile' }]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Organization Profile & Institutional Identity</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage legal entity credentials, accreditation records, and contact channels.
          </p>
        </div>

        {/* Profile Card Header */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#4F46E5] to-[#818CF8] text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0">
            NP
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-on-surface">{info.name || 'NexusPay Academy'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Accredited Institution
              </span>
            </div>
            <p className="text-xs text-outline">{info.tagline || 'Enterprise Cloud & Financial Engineering Academy'}</p>
            <p className="text-[11px] text-on-surface-variant pt-1">{info.address || 'Silicon Valley Innovation Hub, CA 94025, United States'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 space-y-5">
          <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
            Edit Institutional Records
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-on-surface block mb-1">Organization Name</label>
              <input
                type="text"
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface block mb-1">Legal Corporate Entity</label>
              <input
                type="text"
                value={form.legalEntity || 'NexusPay Global Technologies Inc.'}
                onChange={(e) => setForm({ ...form, legalEntity: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-on-surface block mb-1">Official Administrative Email</label>
              <input
                type="email"
                required
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface block mb-1">Institutional Website</label>
              <input
                type="url"
                value={form.website || ''}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface block mb-1">Campus Physical Address</label>
            <input
              type="text"
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface block mb-1">Academy Tagline & Mission Statement</label>
            <textarea
              rows={3}
              value={form.tagline || ''}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-4 border-t border-outline-variant/60 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </OrgLayout>
  );
}
