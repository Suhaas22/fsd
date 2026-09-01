import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Flame, 
  CreditCard, 
  Download, 
  Award, 
  Check, 
  Plus,
  Building2,
  CheckCircle2,
  Clock3,
  UserCheck
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

export default function Profile() {
  const { addToast } = useToast();

  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [orgsList, setOrgsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [submittingOrg, setSubmittingOrg] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: 'Alex Chen',
    email: 'alex.chen@stanford.edu',
    title: 'Senior Fintech Software Engineer',
    university: 'Independent Learner',
  });

  const loadData = () => {
    Promise.all([
      api.student.getProfile('lrn-1').catch(() => null),
      api.student.getPayments('lrn-1').catch(() => []),
      api.student.getOrganizations().catch(() => []),
    ])
      .then(([p, pay, o]) => {
        if (p) {
          setProfile(p);
          setProfileForm({
            name: p.name || 'Alex Chen',
            email: p.email || 'alex.chen@stanford.edu',
            title: p.learnerType || 'Learner',
            university: p.requestedOrgName || p.university || 'Independent Learner',
          });
        }
        setPayments(Array.isArray(pay) ? pay : []);
        setOrgsList(Array.isArray(o) ? o : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.student.updateProfile(profileForm, 'lrn-1');
      addToast('Profile changes saved successfully!', 'success');
    } catch (err) {
      addToast('Failed to save profile: ' + err.message, 'error');
    }
  };

  const handleRequestJoinOrg = async () => {
    if (!selectedOrg) return;
    try {
      setSubmittingOrg(true);
      await api.student.joinOrganization(selectedOrg.id, selectedOrg.name, 'lrn-1');
      addToast(`Join request submitted to ${selectedOrg.name}!`, 'success');
      setShowOrgModal(false);
      loadData();
    } catch (err) {
      addToast('Failed to submit request: ' + err.message, 'error');
    } finally {
      setSubmittingOrg(false);
    }
  };

  const handleDownloadInvoice = (inv) => {
    addToast(`Downloading invoice ${inv.id || '#NX-12345'}...`, 'success');
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  const membershipStatus = profile?.orgMembershipStatus || (profile?.university && profile?.university !== 'Independent Learner' ? 'Verified Student' : 'Independent Learner');
  const universityName = profile?.requestedOrgName || profile?.university || 'Stanford University';

  return (
    <PageLayout>
      <div className="w-full max-w-[1680px] mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/20 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{profileForm.name}</h1>
                {membershipStatus === 'Verified Student' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Official Student
                  </span>
                ) : membershipStatus === 'Pending Organization Approval' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                    <Clock3 className="w-3 h-3 animate-spin" /> Pending Approval
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    Independent Learner
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{profileForm.title} • {universityName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{profileForm.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {membershipStatus === 'Independent Learner' && (
              <button
                onClick={() => setShowOrgModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Building2 className="w-4 h-4" />
                <span>Join Organization to become Student</span>
              </button>
            )}

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-center px-3">
                <span className="text-lg font-black text-slate-900 block">14 Days</span>
                <span className="text-[11px] text-slate-500 font-semibold">Streak</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center px-3">
                <span className="text-lg font-black text-indigo-600 block">{profile?.enrolledCourses || 5}</span>
                <span className="text-[11px] text-slate-500 font-semibold">Enrolled</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center px-3">
                <span className="text-lg font-black text-emerald-600 block">{profile?.certificatesCount || 2}</span>
                <span className="text-[11px] text-slate-500 font-semibold">Certificates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'profile'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Academic Profile
          </button>
          <button
            onClick={() => setActiveSection('billing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'billing'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Billing & Invoices
          </button>
        </div>

        {/* Section Content */}
        {activeSection === 'profile' ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-3xl shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Edit Student & Learner Details</h2>
              <p className="text-xs text-slate-500">Manage your profile, academic affiliation, and communication preferences.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Affiliated Organization / Institution</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    value={universityName}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOrgModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold shrink-0"
                  >
                    Change / Join
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-4xl shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Order History & Payment Records</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Transaction ID</th>
                    <th className="p-3.5">Course / Item</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">No previous transactions recorded on backend.</td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-mono text-slate-800">{p.id || '#NX-12345'}</td>
                        <td className="p-3.5 font-semibold text-slate-900">{p.courseTitle || p.item || 'Masterclass Track'}</td>
                        <td className="p-3.5 font-bold text-slate-900">${p.amount || 89.99}</td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            {p.status || 'Paid'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDownloadInvoice(p)}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-bold text-xs"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* JOIN ORGANIZATION MODAL */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Join an Organization to become a Student</span>
              </div>
              <button onClick={() => setShowOrgModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Select an accredited university or enterprise organization. Submitting a request sends your profile to the Organization Admin for student membership verification.
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {orgsList.map((org) => (
                <div
                  key={org.id}
                  onClick={() => setSelectedOrg(org)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedOrg?.id === org.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{org.name}</h4>
                      <p className="text-[11px] text-slate-500">{org.location} • {org.domain || 'edu'}</p>
                    </div>
                    {selectedOrg?.id === org.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOrgModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedOrg || submittingOrg}
                onClick={handleRequestJoinOrg}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
              >
                {submittingOrg ? 'Submitting...' : 'Submit Join Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
