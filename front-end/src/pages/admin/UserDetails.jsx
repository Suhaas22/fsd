import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  Edit, 
  Trash2, 
  Ban, 
  Award, 
  CreditCard, 
  CheckCircle2, 
  Star,
} from 'lucide-react';
import { Tabs } from '../../components/admin/Tabs';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { UserAvatar } from '../../components/admin/UserAvatar';
import { ConfirmModal } from '../../components/admin/Modals';
import { api } from '../../utils/api';

export const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${userId}`)
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user details:', err);
        setLoading(false);
      });
  }, [userId]);

  const tabs = useMemo(() => {
    if (!user) return [];
    if (user.role === 'Learner') {
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'enrollments', label: 'Enrollments' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'activity', label: 'Activity' },
      ];
    }
    if (user.role === 'Instructor') {
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'courses', label: 'Courses' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'activity', label: 'Activity' },
      ];
    }
    if (user.role === 'Organization') {
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'courses', label: 'Courses' },
        { id: 'instructors', label: 'Instructors' },
        { id: 'learners', label: 'Learners' },
        { id: 'transactions', label: 'Transactions' },
        { id: 'activity', label: 'Activity' },
      ];
    }
    return [
      { id: 'overview', label: 'Overview' },
      { id: 'activity', label: 'Activity' },
    ];
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading user details...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center text-slate-500">User not found</div>;
  }

  const userEnrollments = user.enrollments || [];
  const userCourses = user.courses || [];
  const userTransactions = user.transactions || [];
  const userOrgInstructors = user.orgInstructors || [];
  const userOrgLearners = user.orgLearners || [];
  const userActivities = user.activities || [];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/users')}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Details</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Profile Card */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-6">
            <UserAvatar name={user.name} size="xl" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                {user.name}
                <StatusBadge status={user.status} />
              </h2>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</span>
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> {user.role}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors">
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button 
              onClick={() => setIsSuspendModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-amber-200 bg-amber-50 rounded-lg text-amber-700 hover:bg-amber-100 font-medium transition-colors"
            >
              <Ban className="w-4 h-4" /> Suspend
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-rose-200 bg-rose-50 rounded-lg text-rose-700 hover:bg-rose-100 font-medium transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8 bg-slate-50/50 min-h-[400px]">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-lg">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Registration Date</p>
                    <p className="font-medium text-slate-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" /> {user.createdAt}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Last Login</p>
                    <p className="font-medium text-slate-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" /> {user.lastLogin}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">User ID</p>
                    <p className="font-medium text-slate-800">#{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Role</p>
                    <p className="font-medium text-slate-800">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Account Status</p>
                    <StatusBadge status={user.status} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Verification</p>
                    <StatusBadge status={user.verificationStatus || 'Verified'} />
                  </div>
                </div>
              </div>

              {/* Role-Specific Overview Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-lg">{user.role} Details</h3>
                
                {user.role === 'Learner' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Institution</p>
                      <p className="font-medium text-slate-800">{user.institution || 'Individual Student'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Student ID</p>
                      <p className="font-medium text-slate-800">{user.studentId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Major / Degree</p>
                      <p className="font-medium text-slate-800">{user.degree || 'General'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Graduation Year</p>
                      <p className="font-medium text-slate-800">{user.graduationYear || '2025'}</p>
                    </div>
                  </div>
                )}

                {user.role === 'Instructor' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Area of Expertise</p>
                      <p className="font-medium text-slate-800">{user.expertise || 'Computer Science'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Qualification</p>
                      <p className="font-medium text-slate-800">{user.qualification || 'Certified Instructor'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Affiliated Org</p>
                      <p className="font-medium text-slate-800">{user.organization || 'Independent'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Courses Published</p>
                      <p className="font-medium text-slate-800">{user.coursesCount ?? userCourses.length} Active Courses</p>
                    </div>
                  </div>
                )}

                {user.role === 'Organization' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Official Domain</p>
                      <p className="font-medium text-slate-800">{user.domain || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Organization Type</p>
                      <p className="font-medium text-slate-800">{user.type || 'Enterprise'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Enrolled Learners</p>
                      <p className="font-medium text-slate-800">{user.learnersCount ?? '500+'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Faculty / Instructors</p>
                      <p className="font-medium text-slate-800">{user.instructorsCount ?? '10+'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. ENROLLMENTS TAB (Learner) */}
          {activeTab === 'enrollments' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Enrolled Courses</h3>
                <p className="text-xs text-slate-500">Track learning progress, completion, and grades</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-3.5">Course</th>
                      <th className="px-6 py-3.5">Instructor</th>
                      <th className="px-6 py-3.5">Enrolled Date</th>
                      <th className="px-6 py-3.5">Progress</th>
                      <th className="px-6 py-3.5">Grade</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userEnrollments.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{item.course}</div>
                          <div className="text-xs text-slate-500">{item.organization}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{item.instructor}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.enrolledDate || item.enrollmentDate}</td>
                        <td className="px-6 py-4">
                          <div className="w-36">
                            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                              <span>Progress</span>
                              <span>{item.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-2 rounded-full ${item.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded text-xs">
                            {item.grade || 'A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. COURSES TAB (Instructor / Organization) */}
          {activeTab === 'courses' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Authored / Managed Courses</h3>
                <p className="text-xs text-slate-500">Overview of courses published on the platform</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-3.5">Course Title</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Price</th>
                      <th className="px-6 py-3.5">Students Enrolled</th>
                      <th className="px-6 py-3.5">Rating</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">{course.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{course.category}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">${course.price}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{(course.students || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {course.rating}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={course.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{course.createdDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. INSTRUCTORS TAB (Organization) */}
          {activeTab === 'instructors' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Affiliated Faculty & Instructors</h3>
                <p className="text-xs text-slate-500">Teachers registered under this organization</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-3.5">Instructor</th>
                      <th className="px-6 py-3.5">Specialization / Expertise</th>
                      <th className="px-6 py-3.5">Courses</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userOrgInstructors.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{inst.name}</div>
                          <div className="text-xs text-slate-500">{inst.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{inst.expertise}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{inst.courses} Active Courses</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={inst.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. LEARNERS TAB (Organization) */}
          {activeTab === 'learners' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Enrolled Students & Learners</h3>
                <p className="text-xs text-slate-500">Students participating through this organization's sponsorship</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-3.5">Student</th>
                      <th className="px-6 py-3.5">Program / Major</th>
                      <th className="px-6 py-3.5">Courses</th>
                      <th className="px-6 py-3.5">Verification</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userOrgLearners.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{student.degree || student.program}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{student.enrolledCoursesCount || 1} Courses</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={student.verificationStatus} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={student.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">Financial Transactions</h3>
                <p className="text-xs text-slate-500">Payment history, fees, and invoice records</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      <th className="px-6 py-3.5">Transaction ID</th>
                      <th className="px-6 py-3.5">Description</th>
                      <th className="px-6 py-3.5">Date & Time</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Payment Method</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-primary">{txn.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">{txn.description || txn.course}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{txn.date}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">${txn.amount}</td>
                        <td className="px-6 py-4 text-xs text-slate-600">{txn.paymentMethod || txn.paymentGateway}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={txn.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. ACTIVITY TAB */}
          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="mb-6">
                <h3 className="font-bold text-slate-800">Recent User Activity</h3>
                <p className="text-xs text-slate-500">Audit log and system interactions</p>
              </div>
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {userActivities.map((act) => {
                  return (
                    <div key={act.id} className="relative flex items-start gap-4">
                      <div className="absolute -left-6 top-0.5 p-1.5 rounded-full border border-slate-200 bg-blue-50 text-blue-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="font-semibold text-slate-800 text-sm">{act.title}</h4>
                          <span className="text-xs text-slate-400">{act.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{act.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      <ConfirmModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        onConfirm={() => {
          api.patch(`/users/${user.id}`, { status: 'Suspended' })
            .then(() => {
              setUser({ ...user, status: 'Suspended' });
              setIsSuspendModalOpen(false);
            })
            .catch(err => console.error('Error suspending user:', err));
        }}
        title="Suspend User"
        message={`Are you sure you want to suspend ${user.name}? They will lose access to the platform.`}
        confirmText="Suspend User"
        variant="danger"
      />
    </div>
  );
};
