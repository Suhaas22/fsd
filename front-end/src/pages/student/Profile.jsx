// =========================================================================================
// FDFED M2026 - Student Module: Student Profile & Academic Portfolio
// Design: Stitch Coursera Academic Precision Desktop Layout (NexusPay Learning)
// Author: Student Portal Implementation | IIIT Sri City
// =========================================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  MapPin,
  Calendar,
  Link as LinkIcon,
  Github,
  Globe,
  Flame, 
  CreditCard, 
  Download, 
  Award, 
  Check, 
  Plus,
  Building2,
  CheckCircle2,
  Clock3,
  UserCheck,
  BookOpen,
  PlayCircle,
  ExternalLink,
  Linkedin
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import HumanAvatar from '../../components/common/HumanAvatar';

export default function Profile() {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Overview');
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [orgsList, setOrgsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [submittingOrg, setSubmittingOrg] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: 'Alex Chen',
    email: 'alex.chen@stanford.edu',
    title: 'Senior Financial Systems Engineer',
    location: 'San Francisco, CA',
    bio: 'Specializing in secure transaction processing, distributed ledger architecture, and high-availability financial gateways.',
    university: 'Stanford University',
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
          setProfileForm(prev => ({
            ...prev,
            name: p.name || prev.name,
            email: p.email || prev.email,
            title: p.learnerType || prev.title,
            university: p.requestedOrgName || p.university || prev.university,
          }));
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
      setIsEditing(false);
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-coursera border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  const membershipStatus = profile?.orgMembershipStatus || (profile?.university && profile?.university !== 'Independent Learner' ? 'Verified Student' : 'Independent Learner');
  const universityName = profile?.requestedOrgName || profile?.university || 'Stanford University';

  return (
    <PageLayout>
      <div className="bg-[#F8FAFC] min-h-screen py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* 2-Column Stitch Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Profile Sidebar (4 cols on lg) */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-6 flex flex-col items-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-blue-50 shadow-sm relative">
                  <HumanAvatar name={profileForm.name} size="2xl" />
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-slate-900">{profileForm.name}</h1>
                  {membershipStatus === 'Verified Student' && (
                    <span title="Official Student" className="text-secondary">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-semibold mb-3">{profileForm.title}</p>

                {/* Metadata pills */}
                <div className="space-y-1.5 w-full text-xs text-slate-600 mb-4 pb-4 border-b border-slate-100 text-left">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{profileForm.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Member since Oct 2021</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{universityName}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed text-left mb-5 w-full">
                  {profileForm.bio}
                </p>

                <div className="w-full space-y-2">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full py-2.5 px-4 rounded-lg border border-coursera text-coursera hover:bg-blue-50 text-xs font-bold transition-colors"
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </button>

                  {membershipStatus === 'Independent Learner' && (
                    <button
                      onClick={() => setShowOrgModal(true)}
                      className="w-full py-2.5 px-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-secondary border border-emerald-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Join University</span>
                    </button>
                  )}
                </div>
              </div>

              {/* External Links Card (Stitch Spec) */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Links</h3>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <a 
                      href="https://linkedin.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-slate-600 hover:text-coursera transition-colors group"
                    >
                      <Linkedin className="w-4 h-4 text-slate-400 group-hover:text-coursera" />
                      <span>linkedin.com/in/alexc</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://github.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-slate-600 hover:text-coursera transition-colors group"
                    >
                      <Github className="w-4 h-4 text-slate-400 group-hover:text-coursera" />
                      <span>github.com/alexc-fin</span>
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className="flex items-center gap-2.5 text-slate-600 hover:text-coursera transition-colors group"
                    >
                      <Globe className="w-4 h-4 text-slate-400 group-hover:text-coursera" />
                      <span>alexchen.dev</span>
                    </a>
                  </li>
                </ul>
              </div>

            </aside>

            {/* Right Main Content Area (8 cols on lg) */}
            <main className="lg:col-span-8 space-y-6">
              
              {/* Stats Bar (Stitch Spec: 12 Courses | 4 Certificates | 28 Skills | 140 Hours) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200/80 rounded-xl p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl font-black text-coursera">12</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Courses</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl font-black text-coursera">4</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Certificates</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl font-black text-coursera">28</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Skills</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl font-black text-coursera">140</span>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Hours</span>
                </div>
              </div>

              {/* Tabs Navigation (Stitch Spec) */}
              <div className="border-b border-slate-200 flex gap-4 overflow-x-auto pb-1 scrollbar-none">
                {['Overview', 'Courses', 'Accomplishments', 'Skills', 'Billing & Invoices'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2.5 border-b-2 font-semibold text-xs md:text-sm whitespace-nowrap transition-colors -mb-[1px] ${
                        isActive
                          ? 'border-coursera text-coursera font-bold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Edit Profile Form (Inline Toggle) */}
              {isEditing && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-bold text-slate-900">Update Profile Information</h3>
                  <form onSubmit={handleSaveProfile} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-coursera"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-coursera"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Professional Title</label>
                      <input
                        type="text"
                        value={profileForm.title}
                        onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-coursera"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Bio</label>
                      <textarea
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-coursera"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-coursera text-white rounded-lg text-xs font-bold hover:bg-primary transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab: Overview (Default) */}
              {activeTab === 'Overview' && (
                <div className="space-y-6">
                  
                  {/* Learning Streak Widget (Stitch Spec: 14 Days Fire Icon + 7-Day Chart) */}
                  <section className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span>Learning Streak</span>
                      </h2>
                      <span className="text-xs font-bold text-slate-600">14 Days Active</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mt-3">
                      <div className="h-8 rounded-md bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">M</div>
                      <div className="h-8 rounded-md bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">T</div>
                      <div className="h-8 rounded-md bg-coursera text-white flex items-center justify-center text-[10px] font-bold shadow-xs">W</div>
                      <div className="h-8 rounded-md bg-coursera text-white flex items-center justify-center text-[10px] font-bold shadow-xs">T</div>
                      <div className="h-8 rounded-md bg-coursera text-white flex items-center justify-center text-[10px] font-bold shadow-xs">F</div>
                      <div className="h-8 rounded-md bg-coursera text-white flex items-center justify-center text-[10px] font-bold shadow-xs">S</div>
                      <div className="h-8 rounded-md border-2 border-coursera bg-blue-50 text-coursera flex items-center justify-center text-[10px] font-bold">S</div>
                    </div>
                  </section>

                  {/* Continue Learning Cards */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900">Continue Learning</h2>
                      <Link to="/student/my-learning" className="text-xs font-bold text-coursera hover:underline">
                        View All
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Course Card 1 */}
                      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between hover:shadow-md transition-shadow group">
                        <div className="h-28 bg-gradient-to-r from-blue-900 to-indigo-900 p-4 flex flex-col justify-between relative">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Stanford University</span>
                          <h3 className="text-sm font-bold text-white group-hover:text-blue-100 transition-colors line-clamp-1">
                            Advanced Payment Gateway Architecture
                          </h3>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-coursera h-full rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                            <span>65% Complete</span>
                            <span>2h 15m remaining</span>
                          </div>
                          <Link 
                            to="/student/player"
                            className="w-full py-2 bg-blue-50 hover:bg-coursera text-coursera hover:text-white rounded-lg text-xs font-bold text-center block transition-colors"
                          >
                            Resume Learning
                          </Link>
                        </div>
                      </div>

                      {/* Course Card 2 */}
                      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between hover:shadow-md transition-shadow group">
                        <div className="h-28 bg-gradient-to-r from-slate-800 to-slate-900 p-4 flex flex-col justify-between relative">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Carnegie Mellon</span>
                          <h3 className="text-sm font-bold text-white group-hover:text-slate-100 transition-colors line-clamp-1">
                            Ledger Reconciliation & State Consensus
                          </h3>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-coursera h-full rounded-full" style={{ width: '30%' }}></div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                            <span>30% Complete</span>
                            <span>5h 45m remaining</span>
                          </div>
                          <Link 
                            to="/student/player"
                            className="w-full py-2 bg-blue-50 hover:bg-coursera text-coursera hover:text-white rounded-lg text-xs font-bold text-center block transition-colors"
                          >
                            Resume Learning
                          </Link>
                        </div>
                      </div>

                    </div>
                  </section>

                </div>
              )}

              {/* Tab: Courses */}
              {activeTab === 'Courses' && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Enrolled Courses & Progress</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Advanced Enterprise Architecture & Payment Systems</h4>
                        <p className="text-[11px] text-slate-500">Stanford University • 65% Completed</p>
                      </div>
                      <Link to="/student/player" className="px-3 py-1.5 bg-coursera text-white rounded text-xs font-bold">
                        Continue
                      </Link>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Distributed Ledgers and Two-Phase Commits</h4>
                        <p className="text-[11px] text-slate-500">MIT FinTech Lab • 30% Completed</p>
                      </div>
                      <Link to="/student/player" className="px-3 py-1.5 bg-coursera text-white rounded text-xs font-bold">
                        Continue
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Accomplishments */}
              {activeTab === 'Accomplishments' && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900">Verified Accomplishments</h3>
                    <Link to="/student/certificates" className="text-xs font-bold text-coursera hover:underline">
                      View Certificates Ledger
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                      <Award className="w-8 h-8 text-amber-500 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Advanced Payment Systems</h4>
                        <p className="text-[11px] text-slate-500">Stanford University • Grade: 98.4%</p>
                        <span className="text-[10px] text-secondary font-bold inline-block mt-1">Verified Credential</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                      <Award className="w-8 h-8 text-amber-500 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Fraud Prevention Strategies</h4>
                        <p className="text-[11px] text-slate-500">MIT FinTech Lab • Grade: 95.0%</p>
                        <span className="text-[10px] text-secondary font-bold inline-block mt-1">Verified Credential</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Skills */}
              {activeTab === 'Skills' && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Skills Acquired (28)</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Distributed Systems', 'Payment Gateways', 'Two-Phase Commit', 'Raft Consensus',
                      'PCI-DSS v4.0', 'Tokenization Engines', 'Cloud Security', 'Zero Trust',
                      'High Availability', 'Database Sharding', 'Idempotency', 'Kafka Streams',
                      'Ledger Reconciliation', 'Smart Routing', 'Risk Models', 'Anomaly Detection'
                    ].map((s, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-lg bg-blue-50 text-coursera border border-blue-100 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Billing & Invoices */}
              {activeTab === 'Billing & Invoices' && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Payment History & Tax Invoices</h3>
                    <span className="text-xs text-slate-400 font-medium">{payments.length} transactions</span>
                  </div>

                  {payments.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No payment records found. Enroll in a certified course to generate tuition receipts.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                      {payments.map((p, idx) => (
                        <div key={p.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-coursera" />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{p.courseTitle || 'Tuition Enrollment'}</p>
                              <p className="text-[11px] text-slate-400">{p.date || 'October 2026'} • ID: {p.id || 'TX-9921'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-900">${p.amount || 49}</span>
                            <button
                              onClick={() => handleDownloadInvoice(p)}
                              className="p-1 text-slate-400 hover:text-coursera transition-colors"
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </main>

          </div>

        </div>

        {/* Join Organization Modal */}
        {showOrgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">Join Accredited University or Organization</h3>
              <p className="text-xs text-slate-500">
                Affiliate your student account with an accredited institution to unlock academic tuition subsidies.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {orgsList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Loading university directory...</p>
                ) : (
                  orgsList.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => setSelectedOrg(org)}
                      className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                        selectedOrg?.id === org.id
                          ? 'border-coursera bg-blue-50 text-coursera font-bold ring-1 ring-coursera'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{org.name}</span>
                      {selectedOrg?.id === org.id && <Check className="w-4 h-4 text-coursera" />}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedOrg || submittingOrg}
                  onClick={handleRequestJoinOrg}
                  className="px-5 py-2 rounded-lg bg-coursera text-white text-xs font-bold hover:bg-primary disabled:opacity-50 transition-all shadow-xs"
                >
                  {submittingOrg ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  );
}
