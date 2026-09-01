import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, Building2, FolderOpen, Award, DollarSign, Clock } from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { ChartCard } from '../../components/admin/ChartCard';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { api } from '../../utils/api';

export const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/courses'),
      api.get('/transactions'),
      api.get('/analytics'),
    ])
      .then(([u, c, t, a]) => {
        setUsers(u || []);
        setCourses(c || []);
        setTransactions(t || []);
        setAnalytics(a || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      });
  }, []);

  const recentUsersCols = [
    { header: 'Name', accessor: 'name' },
    { header: 'Role', accessor: 'role' },
    { header: 'Joined', accessor: 'createdAt' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  const stats = {
    totalUsers: analytics?.stats?.totalUsers || users.length.toString(),
    totalLearners: analytics?.stats?.totalLearners || users.filter(u => u.role === 'Student' || u.role === 'Learner').length.toString(),
    totalInstructors: analytics?.stats?.totalInstructors || users.filter(u => u.role === 'Instructor').length.toString(),
    totalRevenue: analytics?.stats?.totalRevenue || `$${transactions.reduce((acc, t) => acc + (t.amount || 0), 0).toFixed(2)}`,
    organizations: analytics?.stats?.organizations || users.filter(u => u.role === 'Organization').length.toString(),
    courses: analytics?.stats?.courses || courses.length.toString(),
    enrollments: analytics?.stats?.enrollments || '18',
    pendingApprovals: analytics?.stats?.pendingApprovals || courses.filter(c => c.status === 'Pending Approval').length.toString(),
  };

  const userGrowthData = analytics?.userGrowth || [
    { name: 'May', learners: 340 },
    { name: 'Jun', learners: 410 },
    { name: 'Jul', learners: 520 },
    { name: 'Aug', learners: 680 },
  ];
  const revenueData = analytics?.revenueData || userGrowthData;
  const pendingApprovals = analytics?.pendingApprovals || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend="up" trendValue="12%" color="primary" />
        <StatCard title="Total Learners" value={stats.totalLearners} icon={GraduationCap} trend="up" trendValue="8%" color="success" />
        <StatCard title="Total Instructors" value={stats.totalInstructors} icon={BookOpen} trend="up" trendValue="4%" color="purple" />
        <StatCard title="Total Revenue" value={stats.totalRevenue} icon={DollarSign} trend="up" trendValue="23%" color="warning" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Organizations" value={stats.organizations} icon={Building2} color="primary" />
        <StatCard title="Courses" value={stats.courses} icon={FolderOpen} color="purple" />
        <StatCard title="Enrollments" value={stats.enrollments} icon={Award} color="success" />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={Clock} color="danger" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="User Growth">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="learners" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="instructors" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Growth">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Two Column Layout for Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Recent Users</h3>
              <Link to="/admin/users" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                View All
              </Link>
            </div>
            <DataTable 
              columns={recentUsersCols} 
              data={users.slice(0, 5)} 
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Action Required</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingApprovals.map((item, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between group cursor-pointer">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </div>
                    <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                  </div>
                  <Link to="/admin/courses/approval" className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Review
                  </Link>
                </div>
              ))}
              <div className="p-4 text-center">
                <Link to="/admin/courses/approval" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                  View All Approvals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
