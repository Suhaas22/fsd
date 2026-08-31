import React from 'react';
import {
  FileText,
  Download,
  Calendar,
  Sparkles,
  ArrowDownToLine,
  BarChart2
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';
import { exportToCSV } from '../../utils/csvDownload';

export default function Reports() {
  const { reports, generateReport, courses, learners, transactions } = useOrg();
  const { addToast } = useToast();

  const reportTemplates = [
    { title: "Monthly Financial Settlement Statement", type: "Financial", desc: "Detailed breakdown of tuition, processor fees, and instructor revenue shares." },
    { title: "Learner Course Completion Audit", type: "Academic", desc: "Per-course student progression, quiz pass rates, and certificates earned." },
    { title: "Instructor Royalty & Hours Statement", type: "Payroll", desc: "Hours delivered, enrolled students, and total quarterly royalty payouts." },
    { title: "Annual Compliance & Accreditation Audit", type: "Compliance", desc: "ISO 27001, FERPA, and SOC 2 institutional compliance audit log." },
    { title: "Course Catalog Engagement Analytics", type: "Analytics", desc: "Student drop-off points, active video minutes, and rating telemetry." },
    { title: "Institutional Tax & Billing Summary", type: "Tax", desc: "Consolidated tax withholding and cross-border settlement receipts." }
  ];

  const handleGenerate = async (template) => {
    try {
      const created = await generateReport(template.title, template.type);
      addToast(`Generated "${created.title}" successfully! Download initiated.`, 'success');

      // Trigger instant CSV download
      const headers = ['Report ID', 'Report Name', 'Category', 'Generated Date', 'Data Status'];
      const rows = [
        [created.id, created.title, created.type, created.date, 'Verified by NexusPay Engine']
      ];
      exportToCSV(`${created.title.toLowerCase().replace(/\s+/g, '_')}.csv`, headers, rows);
    } catch (err) {
      addToast(`Failed to generate report: ${err.message || 'Server error'}`, 'error');
    }
  };

  const handleDownloadRow = (rep) => {
    const headers = ['Report ID', 'Report Name', 'Category', 'Generated Date', 'Audit Status'];
    const rows = [
      [rep.id, rep.title, rep.type, rep.date, 'Audited & Certified']
    ];
    exportToCSV(`${rep.title.toLowerCase().replace(/\s+/g, '_')}.csv`, headers, rows);
    addToast(`Downloaded "${rep.title}"`, 'info');
  };

  return (
    <OrgLayout breadcrumbs={[{ label: 'Reports & Exports' }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Executive Reports & Data Exports</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Generate and export institutional academic audits, financial statements, and compliance ledgers.
          </p>
        </div>

        {/* 6 Report Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTemplates.map((tpl, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 flex flex-col justify-between space-y-4 hover:shadow-elevation-2 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {tpl.type}
                  </span>
                  <FileText className="w-4 h-4 text-outline" />
                </div>
                <h2 className="text-sm font-bold text-on-surface">{tpl.title}</h2>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {tpl.desc}
                </p>
              </div>
              <button
                onClick={() => handleGenerate(tpl)}
                className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-outline-variant"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Generate & Download</span>
              </button>
            </div>
          ))}
        </div>

        {/* Recently Generated Reports Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1">
          <h2 className="text-base font-bold text-on-surface pb-4 border-b border-outline-variant mb-4">
            Recently Generated Institutional Reports
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">Report Title</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold">Generated Date</th>
                  <th className="pb-3 font-bold">File Size</th>
                  <th className="pb-3 font-bold text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 font-bold text-on-surface flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>{rep.title}</span>
                    </td>
                    <td className="py-4 text-outline">{rep.type}</td>
                    <td className="py-4 text-outline">{rep.date}</td>
                    <td className="py-4 font-mono text-outline">{rep.size}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDownloadRow(rep)}
                        className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs inline-flex items-center gap-1 border border-outline-variant transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </OrgLayout>
  );
}
