import React, { useState, useEffect } from 'react';
import { UserAvatar } from '../../components/admin/UserAvatar';
import { Mail, Shield, Clock, Check } from 'lucide-react';
import { api } from '../../utils/api';

export const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@platform.com',
    role: 'Super Admin',
    lastLogin: 'Just now',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/users/11')
      .then(user => {
        if (user) {
          setProfile({
            name: user.name,
            email: user.email,
            role: user.role === 'Admin' ? 'Super Admin' : user.role,
            lastLogin: user.lastLogin,
          });
        }
      })
      .catch(err => console.error('Error fetching admin profile:', err));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    api.patch('/users/11', { name: profile.name, email: profile.email })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      })
      .catch(err => console.error('Error saving profile:', err));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Profile</h1>
          <p className="text-slate-500">Manage your personal information and preferences.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center gap-6">
            <UserAvatar name={profile.name} size="xl" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{profile.name}</h2>
              <div className="mt-2 flex flex-col gap-2 text-sm text-slate-500">
                <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {profile.email}</span>
                <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> {profile.role}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Last login: {profile.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Profile</h3>
          {saved && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
              <Check className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={e => setProfile({ ...profile, name: e.target.value })} 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={e => setProfile({ ...profile, email: e.target.value })} 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm" 
                />
              </div>
            </div>
            <div>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
