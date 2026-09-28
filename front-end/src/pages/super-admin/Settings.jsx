import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  CreditCard,
  Bell,
  Cpu,
  Save,
  Check,
  RotateCcw,
  Key,
  Lock,
  Percent,
  Sliders,
  AlertTriangle,
  Server,
} from 'lucide-react';

export default function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [savedToast, setSavedToast] = useState(false);

  // Revenue Settings
  const [revenueSettings, setRevenueSettings] = useState({
    orgShare: 85,
    superAdminShare: 15,
    payoutCycle: 'instant',
    minPayoutThreshold: 2000,
    currency: 'INR',
    autoDisbursement: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enforce2FA: true,
    sessionTimeoutMinutes: 30,
    ipAllowlistEnabled: false,
    ipAllowlist: '192.168.1.0/24, 10.0.0.0/16',
    auditLoggingLevel: 'Verbose',
    anomalyProtection: true,
  });

  // Governance Settings
  const [governanceSettings, setGovernanceSettings] = useState({
    autoEscalateAbove: 25000,
    requireAdminResolutionNotes: true,
    slaResolutionHours: 24,
    emailAlertsOnUrgent: true,
  });

  // Maintenance & System
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    readOnlyMode: false,
    clearinghouseEngine: 'Live Production Settlement',
    nodeCluster: 'Production Cluster (Primary East)',
  });

  const handleOrgShareChange = (val) => {
    const org = Math.min(99, Math.max(50, Number(val) || 0));
    setRevenueSettings({
      ...revenueSettings,
      orgShare: org,
      superAdminShare: 100 - org,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold mb-1 border border-purple-200/60">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Master Governance Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Super Admin Platform Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure global 85/15 revenue split ratios, automated settlement schedules, and root platform security policies.
          </p>
        </div>

        {savedToast && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Platform policies successfully saved</span>
          </div>
        )}
      </div>

      {/* Main Settings Card with Left Nav & Right Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[560px]">
        {/* Settings Navigation Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 p-4 shrink-0 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">
            Configuration Modules
          </p>

          <button
            onClick={() => setActiveTab('revenue')}
            className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'revenue'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Revenue Split & Payouts</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Access Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'governance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Dispute & Governance SLAs</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Node Cluster & Maintenance</span>
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
            {/* 1. REVENUE SPLIT TAB */}
            {activeTab === 'revenue' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Revenue Split & Royalty Commission</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Control contractual split ratio between academic institutions and NexusPay platform governance fee.
                  </p>
                </div>

                {/* Split Visualizer */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Contractual Ratio Distribution</span>
                    <span className="font-bold text-white text-sm">
                      {revenueSettings.orgShare}% Org / {revenueSettings.superAdminShare}% Platform
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${revenueSettings.orgShare}%` }} className="bg-indigo-500 h-full transition-all"></div>
                    <div style={{ width: `${revenueSettings.superAdminShare}%` }} className="bg-purple-500 h-full transition-all"></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Partner Organizations: {revenueSettings.orgShare}%</span>
                    <span>Super Admin Platform: {revenueSettings.superAdminShare}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Organization Share Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="99"
                      value={revenueSettings.orgShare}
                      onChange={(e) => handleOrgShareChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Default benchmark: 85%</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Super Admin Platform Share (%)
                    </label>
                    <input
                      type="number"
                      disabled
                      value={revenueSettings.superAdminShare}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-purple-700 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Calculated automatically (100% - Org Share)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Payout Settlement Cycle</label>
                    <select
                      value={revenueSettings.payoutCycle}
                      onChange={(e) => setRevenueSettings({ ...revenueSettings, payoutCycle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="instant">Instant Real-Time Automated Clearing</option>
                      <option value="daily">Daily Midnight Batch Clearing</option>
                      <option value="weekly">Weekly Friday Consolidated Payout</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Minimum Payout Threshold (₹)</label>
                    <input
                      type="number"
                      value={revenueSettings.minPayoutThreshold}
                      onChange={(e) => setRevenueSettings({ ...revenueSettings, minPayoutThreshold: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Security & Access Controls</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage session timeouts, two-factor authentication, and IP authorization for Super Admin access.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Enforce Two-Factor Authentication (2FA)</span>
                      <span className="text-[11px] text-slate-500">Require hardware security keys or authenticator TOTP for all Super Admins.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.enforce2FA}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, enforce2FA: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Automated Anomaly Detection</span>
                      <span className="text-[11px] text-slate-500">Auto-lock sessions upon rapid geo-distributed credentials usage.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.anomalyProtection}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, anomalyProtection: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Session Inactivity Timeout</label>
                    <select
                      value={securitySettings.sessionTimeoutMinutes}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeoutMinutes: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes (Recommended)</option>
                      <option value={60}>1 Hour</option>
                      <option value={480}>8 Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Audit Log Verbosity</label>
                    <select
                      value={securitySettings.auditLoggingLevel}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, auditLoggingLevel: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="Verbose">Verbose (All API & Ledger calls)</option>
                      <option value="Standard">Standard (Governance actions only)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. GOVERNANCE TAB */}
            {activeTab === 'governance' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Dispute & Governance Thresholds</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Set rules for automatic escalation to Super Admin.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Auto-Escalate Financial Disputes Above (₹)
                    </label>
                    <input
                      type="number"
                      value={governanceSettings.autoEscalateAbove}
                      onChange={(e) => setGovernanceSettings({ ...governanceSettings, autoEscalateAbove: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Disputes exceeding this amount bypass operational admins straight to Super Admin.</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mandatory Operational Admin SLA Target
                    </label>
                    <select
                      value={governanceSettings.slaResolutionHours}
                      onChange={(e) => setGovernanceSettings({ ...governanceSettings, slaResolutionHours: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold cursor-pointer"
                    >
                      <option value={12}>12 Hours</option>
                      <option value={24}>24 Hours (Standard)</option>
                      <option value={48}>48 Hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SYSTEM TAB */}
            {activeTab === 'system' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Cluster & Node Maintenance</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage active primary cluster and maintenance states.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Maintenance Mode</span>
                      <span className="text-[11px] text-slate-500">Temporarily freeze student checkouts for scheduled upgrades.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Primary Cluster Node</span>
                      <span className="text-[11px] text-slate-500">{systemSettings.nodeCluster}</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active Primary
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Settings apply across all platform environments.</span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Platform Policies</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
