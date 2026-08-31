import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, CreditCard, Layout, Check } from 'lucide-react';
import { Tabs } from '../../components/admin/Tabs';

export const Settings = () => {
  const [activeTab, setActiveTab] = React.useState('general');
  const [settings, setSettings] = useState({
    platformName: 'Coursera Platform',
    supportEmail: 'support@platform.com',
    enableRegistration: true,
    maintenanceMode: false,
    currency: 'USD',
    platformFeePercent: 15,
  });
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'payment', label: 'Payment Settings' },
    { id: 'platform', label: 'Platform Settings' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500">Configure global platform settings and policies.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar for settings */}
        <div className="w-full md:w-64 border-r border-slate-200 bg-slate-50 p-4 hidden md:block">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 font-medium rounded-lg ${activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <SettingsIcon className="w-5 h-5" /> General
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 font-medium rounded-lg ${activeTab === 'security' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Shield className="w-5 h-5" /> Security
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 font-medium rounded-lg ${activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Bell className="w-5 h-5" /> Notifications
            </button>
            <button 
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 font-medium rounded-lg ${activeTab === 'payment' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <CreditCard className="w-5 h-5" /> Payment
            </button>
            <button 
              onClick={() => setActiveTab('platform')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 font-medium rounded-lg ${activeTab === 'platform' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Layout className="w-5 h-5" /> Platform
            </button>
          </nav>
        </div>
        
        {/* Mobile Tabs */}
        <div className="md:hidden px-4 pt-2">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
          </h3>
          {saved && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
              <Check className="w-4 h-4" /> Settings updated successfully!
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
              <input 
                type="text" 
                value={settings.platformName} 
                onChange={e => setSettings({ ...settings, platformName: e.target.value })} 
                className="w-full max-w-md border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
              <input 
                type="email" 
                value={settings.supportEmail} 
                onChange={e => setSettings({ ...settings, supportEmail: e.target.value })} 
                className="w-full max-w-md border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Platform Fee (%)</label>
              <input 
                type="number" 
                value={settings.platformFeePercent} 
                onChange={e => setSettings({ ...settings, platformFeePercent: Number(e.target.value) })} 
                className="w-full max-w-md border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
              />
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
