import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Download, 
  Play, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import CourseCard from '../../components/common/CourseCard';
import api from '../../services/api';

export default function PaymentSuccess() {
  const location = useLocation();
  const state = location.state || {};

  const courseTitle = state.courseTitle || "Advanced Enterprise Architecture & Payment Systems";
  const amount = state.amount || "$89.99";
  const transactionId = state.transactionId || "#NX-48291";
  const date = state.date || "October 2026";
  const courseId = state.courseId || "crs-1";

  const [recommendedCourses, setRecommendedCourses] = useState([]);

  useEffect(() => {
    api.courses.list()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.items || []);
        setRecommendedCourses(list.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const handleDownloadReceipt = () => {
    window.print();
  };

  return (
    <PageLayout>
      <div className="bg-[#F8FAFC] min-h-screen py-10">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/student" className="hover:text-coursera transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/student/explore" className="hover:text-coursera transition-colors">Courses</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-semibold">Order Confirmation</span>
          </nav>

          {/* Success Card (Stitch Spec: 600px max, rounded-xl, green check circle) */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-8 md:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col items-center text-center">
            
            {/* Green Success Icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-secondary flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Payment Successful!
            </h1>
            <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
              Thank you for your purchase. Your course enrollment is confirmed and all lessons and milestone exams are now accessible.
            </p>

            {/* Receipt Summary Box (Stitch Spec) */}
            <div className="w-full bg-slate-50/70 rounded-xl p-5 mb-6 text-left border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Course</p>
                  <p className="text-sm font-bold text-slate-900 line-clamp-1">{courseTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Amount</p>
                  <p className="text-base font-extrabold text-coursera">{amount}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Transaction ID</p>
                  <p className="text-xs font-mono font-medium text-slate-700">{transactionId}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</p>
                  <p className="text-xs font-medium text-slate-700">{date}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-center border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="flex items-center gap-1.5 text-xs font-bold text-coursera hover:underline transition-colors py-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Tax Invoice (PDF)</span>
                </button>
              </div>
            </div>

            {/* Primary Action Button (Stitch Spec) */}
            <div className="w-full space-y-3">
              <Link
                to="/student/player"
                className="w-full py-3.5 bg-coursera hover:bg-primary text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Go to Course Player</span>
              </Link>

              <Link
                to="/student/my-learning"
                className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Return to My Learning</span>
              </Link>
            </div>

          </div>

          {/* Recommended Next Courses */}
          {recommendedCourses.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recommended Next Steps</h2>
                  <p className="text-xs text-slate-500">Other courses chosen by learners in your specialization</p>
                </div>
                <Link to="/student/explore" className="text-xs font-bold text-coursera hover:underline flex items-center gap-1">
                  <span>Browse Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {recommendedCourses.map((c) => (
                  <CourseCard key={c.id} course={c} variant="explore" />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
}
