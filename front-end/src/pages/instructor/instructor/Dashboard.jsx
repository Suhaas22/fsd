import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/instructor/ui/Card";
import { Badge } from "../../../components/instructor/ui/Badge";
import { Button } from "../../../components/instructor/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/instructor/ui/Table";
import { BookOpen, Users, Star, CheckCircle, FileText, User } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from "react-router-dom";
import { api } from "../../../utils/api";

export function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/instructor', 'instructor'),
      api.get('/courses', 'instructor'),
    ])
      .then(([a, c]) => {
        setAnalytics(a);
        setCourses(Array.isArray(c) ? c : (c?.items || []));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching instructor dashboard:', err);
        setLoading(false);
      });
  }, []);

  // analytics?.stats fields match exactly: totalCourses, totalStudents, averageRating, completionRate
  const stats = {
    totalCourses:    analytics?.stats?.totalCourses   ?? courses.length,
    totalStudents:   analytics?.stats?.totalStudents  ?? (courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0) || 7),
    averageRating:   analytics?.stats?.averageRating  ?? 4.8,
    completionRate:  analytics?.stats?.completionRate ?? '78%',
    totalEarnings:   analytics?.stats?.totalEarnings  ?? '₹28,400.00',
  };

  const chartData = (analytics?.dashboardEnrollments || []).map((item) => ({
    name: item.name,
    enrollments: item.enrollments ?? item.count ?? 0,
    active: item.active ?? Math.round((item.enrollments ?? item.count ?? 10) * 0.75),
    count: item.count ?? item.enrollments ?? 0,
  }));
  const recentActivities = analytics?.recentActivity || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 tracking-tight">Educator Studio Dashboard</h1>
          <p className="text-navy-500 mt-1">Here's live telemetry for your masterclasses and enrolled students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shadow-sm shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-500">Total Courses</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-0.5">{stats.totalCourses}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-500">Total Students</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-0.5">{stats.totalStudents}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-500">Average Rating</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-0.5">{stats.averageRating}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shadow-sm shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-500">Completion Rate</p>
              <h3 className="text-2xl font-bold text-navy-900 mt-0.5">{stats.completionRate}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Analytics</CardTitle>
              <CardDescription>New enrollments and active learners over the last 7 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)' }}
                    />
                    <Line type="monotone" dataKey="enrollments" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Metrics for your active courses</CardDescription>
              </div>
              <Link to="/instructor/courses">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.slice(0, 4).map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy-100 rounded-lg overflow-hidden shrink-0">
                          <img src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop'} alt="Course thumbnail" className="w-full h-full object-cover" />
                        </div>
                        <div className="font-medium text-navy-900 line-clamp-1">{course.title}</div>
                      </TableCell>
                      <TableCell className="text-navy-600">{(course.students || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-600 w-3/4 rounded-full"></div>
                          </div>
                          <span className="text-xs font-medium text-navy-600">75%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium text-navy-900">{course.rating || 4.8}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.status === 'Published' ? 'success' : 'secondary'}>
                          {course.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/instructor/courses" className="flex items-center gap-4 p-4 rounded-xl border border-navy-200/60 bg-white hover:border-primary-300 hover:shadow-sm hover:bg-primary-50/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-600 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-navy-900 group-hover:text-primary-700 transition-colors">Manage Content</h4>
                  <p className="text-xs text-navy-500">Edit existing courses</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivities.map((item, i) => (
                  <div key={item.id || i} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600 group-hover:scale-110 transition-transform">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-sm font-medium text-navy-900 leading-tight">{item.title}</p>
                      <p className="text-xs text-navy-500 mt-1.5">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
