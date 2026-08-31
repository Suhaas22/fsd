import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Badge } from "../../../components/instructor/ui/Badge";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/instructor/ui/Table";
import { Avatar } from "../../../components/instructor/ui/Avatar";
import { Search, Users, Activity, CheckCircle, TrendingUp, MessageSquare, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";

export function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    Promise.all([
      api.get('/learners', 'instructor'),
      api.get('/enrollments', 'instructor'),
    ])
      .then(([l, e]) => {
        const studentList = (l || []).map((learner) => {
          const enrollment = (e || []).find((en) => en.learnerId === learner.id || en.learner === learner.name);
          return {
            id: learner.id,
            name: learner.name,
            email: learner.email,
            course: enrollment?.course || "Advanced React Patterns",
            progress: learner.progress ?? enrollment?.progress ?? 75,
            lastActive: learner.lastActive || "2 hours ago",
            status: learner.status || "Active",
          };
        });
        setStudents(studentList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching students:', err);
        setLoading(false);
      });
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (selectedCourse !== "All Courses" && student.course !== selectedCourse) {
        return false;
      }
      if (selectedStatus !== "All" && student.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = student.name?.toLowerCase().includes(q);
        const matchEmail = student.email?.toLowerCase().includes(q);
        const matchCourse = student.course?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCourse) return false;
      }
      return true;
    });
  }, [students, searchQuery, selectedCourse, selectedStatus]);

  const uniqueCourses = useMemo(() => {
    return Array.from(new Set(students.map(s => s.course)));
  }, [students]);

  const activeCount = students.filter(s => s.status === 'Active').length;
  const completedCount = students.filter(s => s.progress === 100).length;
  const avgProgress = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.progress || 0), 0) / students.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Students</h1>
          <p className="text-navy-500">Monitor learner progress, search and manage engagement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900">{students.length}</h3>
            <p className="text-sm text-navy-500 font-medium mt-1">Total Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900">{activeCount}</h3>
            <p className="text-sm text-navy-500 font-medium mt-1">Active Students (30d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900">{avgProgress}%</h3>
            <p className="text-sm text-navy-500 font-medium mt-1">Average Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-navy-900">{completedCount}</h3>
            <p className="text-sm text-navy-500 font-medium mt-1">Completed Courses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-navy-200 flex flex-col sm:flex-row gap-4 justify-between bg-navy-50/50">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name, email..." 
                className="pl-9 pr-8 h-10 bg-white" 
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 p-0.5 rounded-full hover:bg-navy-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="border border-navy-300 rounded-md text-sm px-3 py-2 bg-white flex-1 sm:flex-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              >
                <option value="All Courses">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-navy-300 rounded-md text-sm px-3 py-2 bg-white flex-1 sm:flex-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              >
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading student roster...</div>
          ) : filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar fallback={student.name.charAt(0)} />
                        <div>
                          <div className="font-medium text-navy-900">{student.name}</div>
                          <div className="text-xs text-navy-500">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-navy-700">{student.course}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-navy-100 rounded-full overflow-hidden shrink-0">
                          <div 
                            className={cn("h-full", student.progress === 100 ? "bg-green-500" : "bg-primary-600")}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-navy-700 font-medium">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-navy-500">{student.lastActive}</TableCell>
                    <TableCell>
                      <Badge variant={
                        student.status === 'Active' ? 'success' : 
                        student.status === 'Completed' ? 'primary' : 'secondary'
                      }>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/instructor/students/${student.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <button className="text-navy-400 hover:text-navy-900 p-1 rounded-md hover:bg-navy-50">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-3 text-navy-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-base">No students found</h3>
              <p className="text-sm text-navy-500 mt-1">
                {searchQuery ? `No students matching "${searchQuery}"` : "No students matching current filters."}
              </p>
            </div>
          )}

          <div className="p-4 border-t border-navy-200 flex items-center justify-between">
            <span className="text-sm text-navy-500">
              Showing {filteredStudents.length} of {students.length} entries
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
