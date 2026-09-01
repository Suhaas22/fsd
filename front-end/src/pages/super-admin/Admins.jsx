import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, UserCheck, Trash2, Mail, Lock, Search } from 'lucide-react';
import api from '../../services/api';

export default function SuperAdminAdmins() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Admin' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.superAdmin.getAdmins();
      setUsers(res || []);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.superAdmin.createAdmin(formData);
      setShowModal(false);
      setFormData({ name: '', email: '', role: 'Admin' });
      fetchUsers();
    } catch (err) {
      alert('Failed to create admin: ' + err.message);
    }
  };

  const filteredAdmins = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Management</h1>
          <p className="text-xs text-slate-500">Super Admin control panel to manage Operational System Admins</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New System Admin</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading admin roster from JSON backend...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">Admin Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Role Level</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmins.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <img src={u.avatar} alt="" className="w-7 h-7 rounded-full border border-slate-200" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{u.email}</td>
                    <td className="p-3.5 font-semibold text-indigo-600">{u.role}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="text-xs text-slate-400">System Admin</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Operational Admin</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Save Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
