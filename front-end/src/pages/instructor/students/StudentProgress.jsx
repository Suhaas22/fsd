import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Badge } from "../../../components/instructor/ui/Badge";
import { Button } from "../../../components/instructor/ui/Button";
import { Avatar } from "../../../components/instructor/ui/Avatar";
import { MessageSquare, Mail, Calendar, BookOpen, Clock, Award, CheckCircle, ChevronLeft } from "lucide-react";
import { api } from "../../../utils/api";

export function StudentProgress() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/learners/${id || 1}`, 'instructor'),
      api.get('/enrollments', 'instructor'),
    ])
      .then(([l, e]) => {
        setStudent(l);
        const learnerEnrollments = (e || []).filter(
          (en) => en.learnerId === Number(id || 1) || en.learner === l?.name
        );
        setEnrollments(learnerEnrollments.length > 0 ? learnerEnrollments : [
          {
            id: 1,
            course: "Advanced React Patterns & Architecture",
            enrolledDate: "Oct 12, 2023",
            progress: l?.progress || 85,
            grade: "A",
            status: "Active",
          }
        ]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching student progress:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading student progress...</div>;
  }

  if (!student) {
    return <div className="p-12 text-center text-slate-500">Student not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Link to="/instructor/students" className="text-sm font-medium text-navy-500 hover:text-navy-900 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to Students
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-navy-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar fallback={student.name?.charAt(0)} size="xl" className="h-20 w-20 text-xl font-bold bg-primary-100 text-primary-700" />
          <div>
            <h1 className="text-2xl font-bold text-navy-900">{student.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-navy-600">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {student.email}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {student.institution || 'Caltech'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><MessageSquare className="w-4 h-4 mr-2" /> Message</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary-700 mb-1">{student.enrolledCoursesCount || enrollments.length || 2}</div>
            <p className="text-sm text-navy-500 font-medium">Courses Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{student.completedCoursesCount || 1}</div>
            <p className="text-sm text-navy-500 font-medium">Courses Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">{student.avgScore || 92}%</div>
            <p className="text-sm text-navy-500 font-medium">Avg Quiz Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">{student.learningHours || 34}h</div>
            <p className="text-sm text-navy-500 font-medium">Learning Time</p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-xl font-bold text-navy-900 mt-8 mb-4">Course Progress</h3>

      <div className="space-y-6">
        {enrollments.map((en, idx) => (
          <Card key={en.id || idx} className="border-l-4 border-l-primary-600">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-navy-900">{en.course}</h4>
                      <p className="text-sm text-navy-500">Enrolled on {en.enrolledDate || en.enrollmentDate || 'Recent'}</p>
                    </div>
                    <Badge variant={en.progress === 100 ? "success" : "primary"}>
                      {en.status || (en.progress === 100 ? 'Completed' : 'In Progress')}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1.5">
                      <span className="text-navy-700">Course Progress</span>
                      <span className="text-primary-700 font-bold">{en.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-navy-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-600 rounded-full" style={{ width: `${en.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
