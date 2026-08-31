import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Flame, 
  CreditCard, 
  Download, 
  Bell, 
  Settings, 
  Award, 
  Clock, 
  FileText, 
  Check, 
  Plus,
  Trash2,
  Lock,
  ChevronRight
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/common/Badge';
import { userData } from '../../data/userData';
import { useToast } from '../../components/common/Toast';

export default function Profile() {
  const { addToast } = useToast();

  const [activeSection, setActiveSection] = useState('profile'); // 'profile' | 'billing' | 'notifications' | 'security'
  const [profileForm, setProfileForm] = useState({
    name: userData.name,
    email: userData.email,
    title: userData.title,
    organization: userData.organization,
    timezone: userData.timezone,
    language: userData.language
  });

  const [notifSettings, setNotifSettings] = useState({
    courseReminders: true,
    quizDeadlines: true,
    certificateAlerts: true,
    promotions: false,
    communityReplies: true
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Profile changes saved successfully!', 'success');
  };

  const handleDownloadInvoice = (inv) => {
    addToast(`Downloading invoice ${inv.id} ($${inv.amount.toFixed(2)})...`, 'success');
  };

  return (
    <PageLayout>
      <div className="w-full max-w-[1680px] mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
        
        {/* Profile Header Banner */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-ambient flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-primary/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-on-surface">{userData.name}</h1>
                <Badge variant="primary" size="sm">Enterprise Student</Badge>
              </div>
              <p className="text-xs text-outline font-medium">{userData.title} at <strong className="text-on-surface font-semibold">{userData.organization}</strong></p>
              <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-2 font-medium">
                <span>Member since {userData.memberSince}</span>
                <span>•</span>
                <span className="text-secondary font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Learner ID
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-3">
              <Flame className="w-6 h-6 text-amber-600 fill-current" />
              <div>
                <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">Learning Streak</span>
                <span className="text-lg font-black">{userData.streakDays} Consecutive Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout with Settings Navigation (Sidebar + Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation (3 cols) */}
          <aside className="lg:col-span-3 space-y-2 bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 shadow-ambient">
            {[
              { id: 'profile', label: 'Personal Information', icon: User },
              { id: 'billing', label: 'Billing & Payment Methods', icon: CreditCard },
              { id: 'notifications', label: 'Notification Preferences', icon: Bell },
              { id: 'security', label: 'Security & Password', icon: Lock }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Right Section Content (9 cols) */}
          <main className="lg:col-span-9 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-ambient">
            
            {/* Section 1: Profile Information */}
            {activeSection === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Personal Information</h2>
                  <p className="text-xs text-on-surface-variant">Update your public profile and enterprise credentials</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1.5">Full Legal Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1.5">Enterprise Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1.5">Job Title</label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1.5">Organization / Enterprise</label>
                    <input
                      type="text"
                      value={profileForm.organization}
                      onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1.5">Timezone</label>
                    <select
                      value={profileForm.timezone}
                      onChange={(e) => setProfileForm({ ...profileForm, timezone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
                    >
                      <option>Pacific Standard Time (UTC-8)</option>
                      <option>Eastern Standard Time (UTC-5)</option>
                      <option>Greenwich Mean Time (UTC+0)</option>
                      <option>India Standard Time (UTC+5:30)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1.5">Preferred Language</label>
                    <select
                      value={profileForm.language}
                      onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
                    >
                      <option>English (United States)</option>
                      <option>Spanish (Español)</option>
                      <option>French (Français)</option>
                      <option>German (Deutsch)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            )}

            {/* Section 2: Billing & Invoices */}
            {activeSection === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Payment Methods & Invoices</h2>
                  <p className="text-xs text-on-surface-variant">Manage your saved credit cards, PayPal wallets, and download official receipts</p>
                </div>

                {/* Saved Cards */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">Saved Cards in Vault</span>
                  {userData.savedCards.map((card) => (
                    <div key={card.id} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-outline-variant flex items-center justify-center font-bold text-primary text-xs shadow-xs">
                          {card.brand.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">•••• •••• •••• {card.last4}</p>
                          <p className="text-[11px] text-outline">Expires {card.expMonth}/{card.expYear}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {card.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
                        <button 
                          onClick={() => addToast('Card removed from vault', 'info')}
                          className="p-2 text-outline hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Billing Invoices */}
                <div className="pt-4 border-t border-outline-variant space-y-3">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">Order History & Invoices</span>
                  <div className="divide-y divide-outline-variant/60 border border-outline-variant rounded-2xl overflow-hidden">
                    {userData.billingHistory.map((inv) => (
                      <div key={inv.id} className="p-4 flex items-center justify-between text-xs bg-surface-container-lowest">
                        <div>
                          <p className="font-bold text-on-surface">{inv.courseTitle}</p>
                          <p className="text-[11px] text-outline font-mono">{inv.id} • {inv.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-on-surface">${inv.amount.toFixed(2)}</span>
                          <button
                            onClick={() => handleDownloadInvoice(inv)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Notification Preferences */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Notification Preferences</h2>
                  <p className="text-xs text-on-surface-variant">Configure how you receive course updates and grading alerts</p>
                </div>

                <div className="space-y-4 pt-2 divide-y divide-outline-variant/40">
                  {[
                    { key: 'courseReminders', title: 'Daily Study Reminders', desc: 'Receive gentle reminders to maintain your 14-day study streak' },
                    { key: 'quizDeadlines', title: 'Assessment & Quiz Reminders', desc: 'Get notified when new module quizzes unlock' },
                    { key: 'certificateAlerts', title: 'Certificate Verification Updates', desc: 'Receive official notification when a verified credential is ready' },
                    { key: 'communityReplies', title: 'Discussion Thread Replies', desc: 'Notify me when instructors or peers answer my questions' },
                    { key: 'promotions', title: 'Special Offers & Course Discounts', desc: 'Receive coupons and newly published curriculum previews' }
                  ].map(n => (
                    <div key={n.key} className="pt-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-on-surface">{n.title}</p>
                        <p className="text-[11px] text-outline">{n.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifSettings[n.key]}
                        onChange={(e) => {
                          setNotifSettings({ ...notifSettings, [n.key]: e.target.checked });
                          addToast('Notification preference updated', 'info');
                        }}
                        className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Security */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">Security & Authentication</h2>
                  <p className="text-xs text-on-surface-variant">Update password and enable hardware 2-factor authentication</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1.5">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1.5">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter strong password (min 10 chars)"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    onClick={() => addToast('Password successfully updated', 'success')}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-sm"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </PageLayout>
  );
}
