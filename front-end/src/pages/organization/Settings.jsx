import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Save,
  Bell,
  DollarSign
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';

export default function Settings() {
  const { settings, updateSettings, resetToDefault } = useOrg();
  const { addToast } = useToast();

  const [form, setForm] = useState({ ...settings });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(form);
      addToast('Organization governance settings updated & persisted to backend JSON database!', 'success');
    } catch (err) {
      addToast(`Failed to update settings: ${err.message || 'Server error'}`, 'error');
    }
  };

  const handleReset = async () => {
    try {
      await resetToDefault();
      addToast('JSON database successfully reset to default seeds!', 'info');
    } catch (err) {
      addToast(`Failed to reset database: ${err.message || 'Server error'}`, 'error');
    }
  };

  return (
    <OrgLayout breadcrumbs={[{ label: 'Organization Settings' }]}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Organization Settings & Policies</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Configure automated enrollment rules, payout currency, and security requirements.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Security & Authentication */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 space-y-4">
            <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
              Security & Access Control
            </h2>
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-surface-container-low border border-outline-variant/60">
              <div>
                <span className="font-bold text-xs text-on-surface block">Mandatory Two-Factor Authentication (2FA)</span>
                <span className="text-[11px] text-outline">Require hardware tokens or TOTP for all organization administrators and faculty.</span>
              </div>
              <input
                type="checkbox"
                checked={form.requireTwoFactor}
                onChange={(e) => setForm({ ...form, requireTwoFactor: e.target.checked })}
                className="w-4 h-4 rounded text-primary"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-surface-container-low border border-outline-variant/60">
              <div>
                <span className="font-bold text-xs text-on-surface block">Auto-Approve Enterprise Enrollments</span>
                <span className="text-[11px] text-outline">Automatically grant course access upon university SSO verification without manual review.</span>
              </div>
              <input
                type="checkbox"
                checked={form.autoApproveEnrollments}
                onChange={(e) => setForm({ ...form, autoApproveEnrollments: e.target.checked })}
                className="w-4 h-4 rounded text-primary"
              />
            </label>
          </div>

          {/* Currency & Financial Configuration */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 space-y-4">
            <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
              Financial Settlement Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Settlement Base Currency</label>
                <select
                  value={form.defaultCurrency}
                  onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Default Access Type</label>
                <select
                  value={form.defaultAccessType}
                  onChange={(e) => setForm({ ...form, defaultAccessType: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium"
                >
                  <option>Paid Masterclass</option>
                  <option>Institutional Scholarship</option>
                  <option>Open Enterprise Cohort</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email Alert Notifications */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 space-y-4">
            <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
              Email Notifications & Alerts
            </h2>
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-surface-container-low border border-outline-variant/60">
              <div>
                <span className="font-bold text-xs text-on-surface block">Dispatch Email on Faculty Recruitment Updates</span>
                <span className="text-[11px] text-outline">Send instant alerts when an educator accepts an outreach invitation.</span>
              </div>
              <input
                type="checkbox"
                checked={form.emailAlerts}
                onChange={(e) => setForm({ ...form, emailAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer p-3 rounded-2xl bg-surface-container-low border border-outline-variant/60">
              <div>
                <span className="font-bold text-xs text-on-surface block">Faculty Royalty Disbursement Notices</span>
                <span className="text-[11px] text-outline">Notify dean when quarterly royalty pools are calculated.</span>
              </div>
              <input
                type="checkbox"
                checked={form.royaltyAlerts}
                onChange={(e) => setForm({ ...form, royaltyAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-primary"
              />
            </label>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-outline hover:text-red-600 font-bold"
            >
              Reset Database to Factory Default Seeds
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        </form>
      </div>
    </OrgLayout>
  );
}
