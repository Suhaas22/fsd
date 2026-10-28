import React from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  GraduationCap,
  BookOpen,
  Building2,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Layers,
  ArrowRight,
  Users,
  CreditCard,
} from 'lucide-react';
import { useRemoteData } from '../../hooks/useRemoteData';
import {
  AdminHeader,
  AdminMetric,
  AdminSectionHeader,
  AdminDataState,
} from '../../components/admin/AdminUI';
import { money, currencyLabel } from '../../utils/adminDisplay';
export const Dashboard = () => {
  const state = useRemoteData('/admin/overview');
  const data = state.data;
  return (
    <div className="admin-page dashboard-page">
      <AdminHeader title="Overview" />
      <AdminDataState {...state} />
      {data && !state.error && (
        <>
          <div className="admin-stats-grid">
            <AdminMetric
              label="Total learners"
              value={data.stats.learners}
              icon={GraduationCap}
              detail={`${data.stats.activeLearners} active learners`}
              to="/admin/users?role=Learner"
            />
            <AdminMetric
              label="Published courses"
              value={data.stats.publishedCourses}
              icon={BookOpen}
              accent="blue"
              detail={`${data.stats.courses} courses in the library`}
              to="/admin/courses?status=Published"
            />
            <AdminMetric
              label="Organizations"
              value={data.stats.organizations}
              icon={Building2}
              accent="amber"
              detail={`${data.stats.instructors} instructors across the platform`}
              to="/admin/users?role=Organization"
            />
            <AdminMetric
              label="Awaiting approval"
              value={data.stats.pendingApprovals}
              icon={CheckCircle2}
              accent="rose"
              detail="Submitted courses ready for review"
              to="/admin/courses/approval"
            />
          </div>
          <div className="admin-dashboard-columns">
            <section className="admin-card">
              <AdminSectionHeader
                title="Community growth"
                description="New learner registrations · last six months"
              >
                <span className="admin-count-label">Learners</span>
              </AdminSectionHeader>
              <div style={{ height: 245, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.learnerTrend}
                    margin={{ top: 10, left: -23, right: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="adminGrowthFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#9abb83"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#9abb83"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="#eef1e9"
                      strokeDasharray="4 4"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#93a08a' }}
                      tickMargin={12}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#93a08a' }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: '#e4eadf',
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="learners"
                      stroke="#71935e"
                      strokeWidth={2.5}
                      fill="url(#adminGrowthFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="admin-card">
              <AdminSectionHeader
                title="Approval queue"
                description="Your next course reviews"
              >
                <Link to="/admin/courses/approval">
                  View all
                  <ArrowUpRight size={13} />
                </Link>
              </AdminSectionHeader>
              {data.pendingCourses.length ? (
                data.pendingCourses.map((c) => (
                  <Link
                    className="admin-user-row"
                    key={c.id}
                    to={`/admin/courses/${c.id}`}
                  >
                    <span className="admin-icon-tile admin-icon-amber">
                      <BookOpen size={18} />
                    </span>
                    <div>
                      <strong>{c.title}</strong>
                      <small>
                        {c.organizationName || 'Organization not recorded'}
                      </small>
                    </div>
                    <ArrowUpRight size={16} />
                  </Link>
                ))
              ) : (
                <div className="admin-empty !border-0 !p-5 !shadow-none">
                  <span className="admin-empty-icon">
                    <CheckCircle2 size={26} />
                  </span>
                  <h2>You’re all caught up</h2>
                  <p>New course submissions will appear here for review.</p>
                </div>
              )}
            </section>
          </div>
          <div className="admin-dashboard-columns">
            <section className="admin-card">
              <AdminSectionHeader
                title="Your community"
                description="Recently added learners and organizations"
              >
                <Link to="/admin/users">
                  View directory
                  <ArrowUpRight size={13} />
                </Link>
              </AdminSectionHeader>
              {data.recentUsers.map((u) => (
                <Link
                  key={u.id}
                  to={`/admin/users/${u.id}`}
                  className="admin-user-row"
                >
                  <span className="admin-avatar">
                    {u.name?.charAt(0) || '?'}
                  </span>
                  <div>
                    <strong>{u.name || 'Name not recorded'}</strong>
                    <small>{u.email || 'Email not recorded'}</small>
                  </div>
                  <span className="admin-count-label">{u.role}</span>
                  <ArrowUpRight size={15} />
                </Link>
              ))}
            </section>
            <div className="grid gap-5">
              <section className="admin-card">
                <AdminSectionHeader title="Learning activity">
                  <Users size={18} />
                </AdminSectionHeader>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="admin-metric-value">
                      {data.stats.enrollments}
                    </p>
                    <p className="admin-metric-label">Total enrollments</p>
                  </div>
                  <Link to="/admin/users?role=Learner" className="admin-button">
                    View learners
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </section>
              <section className="admin-card">
                <AdminSectionHeader title="Completed payment volume">
                  <CreditCard size={18} />
                </AdminSectionHeader>
                {data.paymentTotals.length ? (
                  data.paymentTotals.map((g) => (
                    <div key={g.currency || 'unknown'} className="mb-3">
                      <p className="admin-metric-value !text-2xl">
                        {money(g.amount, g.currency)}
                      </p>
                      <p className="admin-metric-detail">
                        {currencyLabel(g.currency)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="admin-muted">No completed payments recorded.</p>
                )}
                <Link to="/admin/payments" className="admin-count-label mt-3">
                  View payments
                  <ArrowUpRight size={13} />
                </Link>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
