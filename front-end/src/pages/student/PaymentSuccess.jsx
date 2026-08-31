import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Download, 
  Play, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import CourseCard from '../../components/common/CourseCard';
import { coursesData } from '../../data/coursesData';

export default function PaymentSuccess() {
  const location = useLocation();
  const state = location.state || {};

  const courseTitle = state.courseTitle || "Advanced Enterprise Architecture & Payment Systems";
  const amount = state.amount || "$89.99";
  const transactionId = state.transactionId || "#NX-48291";
  const date = state.date || "October 24, 2024";

  const recommendedCourses = coursesData.slice(2, 5);

  const handleDownloadReceipt = () => {
    window.print();
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-outline mb-6 font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/checkout" className="hover:text-primary transition-colors">Checkout</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary font-semibold">Payment Success</span>
        </nav>

        {/* Success Confirmation Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 md:p-12 text-center shadow-elevation-2 mb-12 relative overflow-hidden">
          
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6 shadow-elevation-1 animate-bounce">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Enrollment Confirmed & Verified</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-on-surface tracking-tight mb-2">
            Payment Successful!
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant max-w-md mx-auto mb-8">
            Thank you for your purchase. Your payment has been processed and all course modules and certificate milestones are now unlocked.
          </p>

          {/* Receipt Voucher Summary Box */}
          <div className="max-w-lg mx-auto bg-surface-container-low border border-outline-variant rounded-2xl p-6 text-left mb-8 shadow-ambient">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">Transaction Receipt</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified by NexusPay
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-outline">Enrolled Course:</span>
                <span className="font-bold text-on-surface text-right max-w-[260px] truncate">{courseTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Amount Paid:</span>
                <span className="font-bold text-primary text-sm">{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Transaction ID:</span>
                <span className="font-mono font-semibold text-on-surface">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Billing Date:</span>
                <span className="font-medium text-on-surface">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Payment Method:</span>
                <span className="font-medium text-on-surface">Visa •••• 4242</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/player"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-sm shadow-elevation-1 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Learning Now</span>
            </Link>

            <button
              onClick={handleDownloadReceipt}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-colors border border-outline-variant"
            >
              <Download className="w-4 h-4" />
              <span>Download Receipt</span>
            </button>

            <Link
              to="/my-learning"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-sm transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to My Learning</span>
            </Link>
          </div>

        </div>

        {/* Recommended Next Steps / Courses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Next Recommended Courses</h2>
              <p className="text-xs text-on-surface-variant">Learners who enrolled in this also studied</p>
            </div>
            <Link to="/explore" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              <span>View Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedCourses.map((course) => (
              <CourseCard key={course.id} course={course} variant="explore" />
            ))}
          </div>
        </section>

      </div>
    </PageLayout>
  );
}
