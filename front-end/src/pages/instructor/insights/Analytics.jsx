import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Download, CheckCircle, TrendingUp, Star } from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from "../../../utils/api";

export function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/instructor', 'instructor')
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching instructor analytics:', err);
        setLoading(false);
      });
  }, []);

  const stats = analytics?.stats || {
    totalEnrollments: '4,892',
    activeLearners: '1,245',
    completionRate: '68%',
    averageRating: 4.8,
  };

  const enrollmentData = analytics?.enrollmentTrend || [];
  const coursePerformance = analytics?.coursePerformance || [];
  const engagementData = analytics?.engagementData || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-navy-500 mt-1">Comprehensive insights into your teaching performance.</p>
        </div>
        <div className="flex gap-3">
          <select className="border border-navy-200 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm">
            <option>Last 30 Days</option>
            <option>Last 6 Months</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
          <Button variant="outline" className="shadow-sm bg-white hover:bg-navy-50">
            <Download className="w-4 h-4 mr-2" /> 
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <TrendingUp className="w-20 h-20 text-emerald-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium text-navy-500 mb-1">Total Enrollments</p>
            <h3 className="text-3xl font-bold text-navy-900 mb-2">{stats.totalEnrollments}</h3>
            <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
              <TrendingUp className="w-3 h-3 mr-1" /> +12.5% vs last period
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <TrendingUp className="w-20 h-20 text-emerald-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium text-navy-500 mb-1">Active Learners</p>
            <h3 className="text-3xl font-bold text-navy-900 mb-2">{stats.activeLearners}</h3>
            <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
              <TrendingUp className="w-3 h-3 mr-1" /> +5.2% vs last period
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <CheckCircle className="w-20 h-20 text-primary-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium text-navy-500 mb-1">Avg Completion Rate</p>
            <h3 className="text-3xl font-bold text-navy-900 mb-2">{stats.completionRate}</h3>
            <div className="flex items-center text-sm font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full w-fit">
              <CheckCircle className="w-3 h-3 mr-1" /> Top 20% of instructors
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Star className="w-20 h-20 text-amber-600" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-medium text-navy-500 mb-1">Average Rating</p>
            <h3 className="text-3xl font-bold text-navy-900 mb-2">{stats.averageRating}</h3>
            <div className="flex items-center text-sm font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full w-fit">
              <Star className="w-3 h-3 mr-1 fill-current" /> 1,245 total reviews
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-navy-200">
          Loading analytics...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trend</CardTitle>
              <CardDescription>New student enrollments over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enrollmentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)' }} />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb', strokeWidth: 0}} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>Total students per course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coursePerformance} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)' }} />
                    <Bar dataKey="students" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
              <CardDescription>Total hours of video watched and lessons completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)' }} />
                    <Area type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
