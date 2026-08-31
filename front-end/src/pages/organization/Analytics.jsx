import React, { useState } from 'react';
import {
  Star,
  TrendingUp,
  BookOpen,
  Users,
  Award,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  PieChart,
  BarChart2
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';

export default function Analytics() {
  const { courses, instructors, stats } = useOrg();
  const [timeframe, setTimeframe] = useState('30d');

  // Dynamic metrics based on timeframe
  const timeframeData = {
    '7d': {
      enrollments: 58,
      enrollmentDelta: '+8.2%',
      enrollmentPrev: 'vs 53 in previous 7 days',
      completionRate: 74,
      avgRating: 4.9,
      revenue: Math.round((stats.monthlyRevenue || 42800) * 0.26),
      revenueGrowth: '+14.2%',
      chartPoints: [
        { label: 'Mon', val: 7, cx: 15, cy: 105 },
        { label: 'Tue', val: 9, cx: 85, cy: 92 },
        { label: 'Wed', val: 12, cx: 155, cy: 75 },
        { label: 'Thu', val: 14, cx: 225, cy: 62 },
        { label: 'Fri', val: 18, cx: 295, cy: 45 },
        { label: 'Sat', val: 22, cx: 365, cy: 30 },
        { label: 'Sun', val: 26, cx: 450, cy: 12 }
      ],
      curvePath: "M 15,105 C 50,98 120,84 155,75 C 190,68 260,53 295,45 C 330,37 400,21 450,12",
      areaPath: "M 15,105 C 50,98 120,84 155,75 C 190,68 260,53 295,45 C 330,37 400,21 450,12 L 450,125 L 15,125 Z"
    },
    '30d': {
      enrollments: 234,
      enrollmentDelta: '+12.4%',
      enrollmentPrev: 'vs 208 in previous 30 days',
      completionRate: 72,
      avgRating: 4.8,
      revenue: stats.monthlyRevenue || 42800,
      revenueGrowth: '+18.4%',
      chartPoints: [
        { label: 'May', val: 105, cx: 15, cy: 105 },
        { label: 'Jun', val: 142, cx: 102, cy: 85 },
        { label: 'Jul', val: 178, cx: 189, cy: 68 },
        { label: 'Aug', val: 204, cx: 276, cy: 45 },
        { label: 'Sep', val: 218, cx: 363, cy: 26 },
        { label: 'Oct', val: 234, cx: 450, cy: 8 }
      ],
      curvePath: "M 15,105 C 75,92 120,78 175,65 C 230,52 285,38 340,26 C 390,18 425,12 450,8",
      areaPath: "M 15,105 C 75,92 120,78 175,65 C 230,52 285,38 340,26 C 390,18 425,12 450,8 L 450,125 L 15,125 Z"
    },
    '90d': {
      enrollments: 680,
      enrollmentDelta: '+21.5%',
      enrollmentPrev: 'vs 560 in previous quarter',
      completionRate: 70,
      avgRating: 4.8,
      revenue: Math.round((stats.monthlyRevenue || 42800) * 2.85),
      revenueGrowth: '+26.8%',
      chartPoints: [
        { label: 'Q1 Wk1', val: 320, cx: 15, cy: 110 },
        { label: 'Q1 Wk4', val: 410, cx: 120, cy: 88 },
        { label: 'Q1 Wk8', val: 530, cx: 230, cy: 60 },
        { label: 'Q1 Wk12', val: 680, cx: 450, cy: 10 }
      ],
      curvePath: "M 15,110 C 70,99 170,74 230,60 C 300,44 380,24 450,10",
      areaPath: "M 15,110 C 70,99 170,74 230,60 C 300,44 380,24 450,10 L 450,125 L 15,125 Z"
    },
    '1y': {
      enrollments: 2450,
      enrollmentDelta: '+38.6%',
      enrollmentPrev: 'vs 1,768 in prior annual cycle',
      completionRate: 69,
      avgRating: 4.8,
      revenue: stats.totalRevenue || 128450,
      revenueGrowth: '+44.2%',
      chartPoints: [
        { label: 'Q1', val: 420, cx: 15, cy: 115 },
        { label: 'Q2', val: 890, cx: 150, cy: 82 },
        { label: 'Q3', val: 1640, cx: 300, cy: 45 },
        { label: 'Q4', val: 2450, cx: 450, cy: 6 }
      ],
      curvePath: "M 15,115 C 80,100 220,62 300,45 C 360,32 410,16 450,6",
      areaPath: "M 15,115 C 80,100 220,62 300,45 C 360,32 410,16 450,6 L 450,125 L 15,125 Z"
    }
  };

  const currentData = timeframeData[timeframe] || timeframeData['30d'];

  return (
    <OrgLayout breadcrumbs={[{ label: 'Analytics' }]}>
      <div className="space-y-6">
        
        {/* Header & Timeframe Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Organization Intelligence & Analytics</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Comprehensive telemetry on learner engagement, course completion velocities, and institutional revenue.
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface-container-low border border-outline-variant">
            {['7d', '30d', '90d', '1y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === tf ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Cohort Enrollments</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-on-surface">{currentData.enrollments}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {currentData.enrollmentDelta}
              </span>
            </div>
            <p className="text-[11px] text-outline mt-1">{currentData.enrollmentPrev}</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Course Completion Rate</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-primary">{currentData.completionRate}%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                +4.1%
              </span>
            </div>
            <p className="text-[11px] text-outline mt-1">Above enterprise benchmark (65%)</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Student Satisfaction Rating</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-amber-600 flex items-center gap-1">
                <Star className="w-5 h-5 fill-current" /> {currentData.avgRating}
              </span>
              <span className="text-xs font-bold text-outline">1,245 reviews</span>
            </div>
            <p className="text-[11px] text-outline mt-1">98% positive faculty feedback</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-elevation-1">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Institutional Revenue</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-emerald-700">${currentData.revenue.toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {currentData.revenueGrowth}
              </span>
            </div>
            <p className="text-[11px] text-outline mt-1">Verified gross settlement</p>
          </div>
        </div>

        {/* Row 1: Charts (Enrollment Trends Line Chart + Revenue by Category Donut Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Enrollment Trends Line/Area Chart (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
              <div>
                <h2 className="text-base font-bold text-on-surface">Enrollment Velocity & Trajectory</h2>
                <p className="text-xs text-on-surface-variant">Active student acquisition progression ({timeframe.toUpperCase()})</p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {currentData.enrollmentDelta} Trajectory
              </span>
            </div>

            {/* Chart Area with HTML Y-Axis and Responsive SVG Curve */}
            <div className="relative flex gap-3 h-44 pt-1">
              {/* Left Y-Axis Labels */}
              <div className="flex flex-col justify-between text-[10px] font-semibold text-outline pb-5 select-none text-right w-8">
                <span>High</span>
                <span>Mid</span>
                <span>Low</span>
                <span>0</span>
              </div>

              {/* Main SVG Graph Container */}
              <div className="flex-1 flex flex-col justify-between relative">
                <svg viewBox="0 0 460 130" className="w-full h-36 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="enrAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.28" />
                      <stop offset="80%" stopColor="#4F46E5" stopOpacity="0.04" />
                      <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Guidelines */}
                  <line x1="0" y1="5" x2="460" y2="5" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
                  <line x1="0" y1="45" x2="460" y2="45" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
                  <line x1="0" y1="85" x2="460" y2="85" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
                  <line x1="0" y1="125" x2="460" y2="125" stroke="#CBD5E1" strokeWidth="1" strokeOpacity="0.9" />

                  {/* Smooth Area Fill */}
                  <path
                    d={currentData.areaPath}
                    fill="url(#enrAreaGrad)"
                  />

                  {/* Primary Trend Curve */}
                  <path
                    d={currentData.curvePath}
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points on Curve */}
                  {currentData.chartPoints.map((pt, i) => (
                    <g key={i} className="group cursor-pointer">
                      <circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r="4.5"
                        fill="#FFFFFF"
                        stroke="#4F46E5"
                        strokeWidth="3"
                        className="transition-transform group-hover:scale-150"
                      />
                      {/* Tooltip on hover */}
                      <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <rect x={pt.cx - 22} y={pt.cy - 28} width="44" height="20" rx="6" fill="#0F172A" />
                        <text x={pt.cx} y={pt.cy - 14} fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle">
                          {pt.val}
                        </text>
                      </g>
                    </g>
                  ))}
                </svg>

                {/* Month X-Axis Labels */}
                <div className="flex justify-between text-[10px] font-bold text-outline uppercase tracking-wider pt-1 px-1">
                  {currentData.chartPoints.map((pt, i) => (
                    <span key={i}>{pt.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Category (5 cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
            <h2 className="text-base font-bold text-on-surface pb-2 border-b border-outline-variant">
              Revenue by Academic Domain
            </h2>

            {/* Visual Ring Donut Chart Representation */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                  {/* Circle 1: Cloud 40% */}
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#4F46E5" strokeWidth="3.8" strokeDasharray="40 60" strokeDashoffset="0" />
                  {/* Circle 2: ML 30% */}
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="3.8" strokeDasharray="30 70" strokeDashoffset="-40" />
                  {/* Circle 3: Security 17% */}
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F59E0B" strokeWidth="3.8" strokeDasharray="17 83" strokeDashoffset="-70" />
                  {/* Circle 4: DevOps 13% */}
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#64748B" strokeWidth="3.8" strokeDasharray="13 87" strokeDashoffset="-87" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-[10px] text-outline uppercase font-bold block">Period</span>
                  <span className="text-sm font-black text-on-surface">${Math.round(currentData.revenue / 1000)}k</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]"></span>
                <span className="font-semibold text-on-surface">Cloud Architecture (40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                <span className="font-semibold text-on-surface">Machine Learning (30%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                <span className="font-semibold text-on-surface">Cybersecurity (17%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]"></span>
                <span className="font-semibold text-on-surface">DevOps (13%)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Row 2: Top Performing Courses & Top Faculty Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Performing Courses */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
            <h2 className="text-base font-bold text-on-surface pb-2 border-b border-outline-variant">
              Top Performing Courses
            </h2>
            <div className="divide-y divide-outline-variant/40">
              {courses.slice(0, 4).map((c, rank) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-surface-container text-outline font-bold text-xs flex items-center justify-center">
                      #{rank + 1}
                    </span>
                    <img src={c.thumbnail} alt={c.title} className="w-10 h-8 rounded-lg object-cover" />
                    <div>
                      <h3 className="font-bold text-xs text-on-surface line-clamp-1">{c.title}</h3>
                      <p className="text-[10px] text-outline">{c.instructorName} • {c.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700">${(c.revenue || (c.price * (c.enrolledCount || 0))).toLocaleString()}</span>
                    <span className="text-[10px] text-outline block">{c.enrolledCount || 0} learners</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Instructors */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
            <h2 className="text-base font-bold text-on-surface pb-2 border-b border-outline-variant">
              Top Faculty Instructors
            </h2>
            <div className="divide-y divide-outline-variant/40">
              {instructors.slice(0, 4).map((inst, rank) => (
                <div key={inst.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-surface-container text-outline font-bold text-xs flex items-center justify-center">
                      #{rank + 1}
                    </span>
                    <img src={inst.avatar} alt={inst.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <h3 className="font-bold text-xs text-on-surface">{inst.name}</h3>
                      <p className="text-[10px] text-outline">{inst.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700">${inst.revenueGenerated.toLocaleString()}</span>
                    <span className="text-[10px] text-outline block">{inst.enrolledStudents} students</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </OrgLayout>
  );
}
