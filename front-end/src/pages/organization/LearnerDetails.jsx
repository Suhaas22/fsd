import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Mail,
  Calendar,
  Award,
  CreditCard,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { LinearProgressBar } from '../../components/common/ProgressBar';

export default function LearnerDetails() {
  const { id } = useParams();
  const { learners, transactions } = useOrg();
  const learner = learners.find(l => l.id === id) || learners[0];
  const learnerTransactions = transactions.filter(t => t.payer === learner.name);

  return (
    <OrgLayout
      breadcrumbs={[
        { label: 'Learners', path: '/learners' },
        { label: learner.name }
      ]}
    >
      <div className="space-y-6">
        {/* Back Link */}
        <Link to="/learners" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Learners List</span>
        </Link>

        {/* Profile Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 flex flex-col md:flex-row items-center gap-6">
          <img src={learner.avatar} alt={learner.name} className="w-24 h-24 rounded-3xl object-cover shadow-sm flex-shrink-0" />
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl font-bold text-on-surface">{learner.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{learner.status}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface text-xs font-semibold">
                {learner.learnerType}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">{learner.university}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-outline pt-1">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {learner.email}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Enrolled since {learner.joinedDate}</span>
            </div>
          </div>
          <div className="text-center md:text-right">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Total Spent</span>
            <p className="text-2xl font-black text-primary">${learner.totalSpent.toFixed(2)}</p>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Enrolled Courses</span>
            <p className="text-xl font-bold text-on-surface mt-1">{learner.enrolledCourses}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Completed Tracks</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">{learner.completedCourses}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Assessment Avg</span>
            <p className="text-xl font-bold text-primary mt-1">{learner.avgScore}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Accredited Certs</span>
            <p className="text-xl font-bold text-amber-600 mt-1">{learner.certificatesCount}</p>
          </div>
        </div>

        {/* 1. Enrolled Courses Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
          <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
            Enrolled Courses & Progress
          </h2>
          <div className="divide-y divide-outline-variant/40">
            {orgData.courses.slice(0, 3).map((c, idx) => (
              <div key={c.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 max-w-md">
                  <img src={c.thumbnail} alt={c.title} className="w-12 h-9 rounded-lg object-cover" />
                  <div>
                    <h3 className="font-bold text-xs text-on-surface">{c.title}</h3>
                    <p className="text-[11px] text-outline">{c.instructorName} • {c.category}</p>
                  </div>
                </div>
                <div className="w-full sm:w-60">
                  <LinearProgressBar progress={idx === 0 ? 72 : idx === 1 ? 40 : 100} showLabel={true} height="h-2" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  idx === 2 ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {idx === 2 ? 'Completed' : 'In Progress'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Certificates Earned Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
            <h2 className="text-base font-bold text-on-surface">Certificates Earned ({learner.certificatesCount})</h2>
            <span className="text-xs text-outline font-medium">Cryptographically Verified</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xs text-on-surface">Advanced Enterprise Architecture Certificate</h3>
                <p className="text-[11px] text-outline mt-0.5">Credential ID: NX-CERT-2026-0819</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">Issued: August 14, 2026</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xs text-on-surface">FinTech Machine Learning & Fraud AI</h3>
                <p className="text-[11px] text-outline mt-0.5">Credential ID: NX-CERT-2026-0542</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-1">Issued: May 28, 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Payment History Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
          <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
            Payment History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant/60">
                  <th className="pb-3 font-bold">Transaction ID</th>
                  <th className="pb-3 font-bold">Course Track</th>
                  <th className="pb-3 font-bold">Method</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {(learnerTransactions.length > 0 ? learnerTransactions : [
                  { id: "TXN-884920", course: "Advanced Enterprise Architecture", method: "Visa •••• 4242", date: "Oct 24, 2026", amount: 89.99, status: "Completed" },
                  { id: "TXN-884812", course: "Machine Learning for Fraud Detection", method: "Visa •••• 4242", date: "Jul 15, 2026", amount: 99.99, status: "Completed" },
                  { id: "TXN-884701", course: "Zero-Trust Cybersecurity & Banking", method: "Visa •••• 4242", date: "Apr 02, 2026", amount: 79.99, status: "Completed" }
                ]).map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-on-surface">{tx.id}</td>
                    <td className="py-3 text-on-surface-variant font-medium">{tx.course}</td>
                    <td className="py-3 text-outline">{tx.method}</td>
                    <td className="py-3 text-outline">{tx.date}</td>
                    <td className="py-3 font-bold text-emerald-700">${tx.amount.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Recent Activity Log */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-3">
          <h2 className="text-base font-bold text-on-surface pb-2 border-b border-outline-variant">
            Recent Student Activity
          </h2>
          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-on-surface font-medium">Completed Quiz: "Consensus Protocols & Two-Phase Locking" (Score: 95%)</p>
              <span className="text-[10px] text-outline ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <p className="text-on-surface font-medium">Watched Lesson 4: "Multi-Region AWS Replication Architecture"</p>
              <span className="text-[10px] text-outline ml-auto">Yesterday</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <p className="text-on-surface font-medium">Submitted Lab Exercise: "Building High Throughput Event Streaming"</p>
              <span className="text-[10px] text-outline ml-auto">3 days ago</span>
            </div>
          </div>
        </div>

      </div>
    </OrgLayout>
  );
}
