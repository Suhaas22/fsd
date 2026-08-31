import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  FileText,
  MessageSquare,
  Sparkles,
  BookOpen,
  User,
  Scale,
  X,
  Send,
  Check
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';

export default function Disputes() {
  const { disputes, raiseDispute, updateDisputeStatus, resolveDispute, courses, instructors, learners, info } = useOrg();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  // Form State for Raising Dispute
  const [newDisputeForm, setNewDisputeForm] = useState({
    disputeType: 'Royalty Payout Discrepancy',
    subject: '',
    description: '',
    courseId: courses[0]?.id || '',
    priority: 'High',
    raisedByRole: 'Organization',
    desiredResolution: ''
  });

  const disputeCategories = [
    'Royalty Payout Discrepancy',
    'Course Content Quality',
    'Academic Misconduct / Plagiarism',
    'Copyright & IP Infringement',
    'Tuition Chargeback & Refund Appeal',
    'Instructor Contract / SLA Breach',
    'Grading & Certificate Verification',
    'Technical & Lab System Anomaly'
  ];

  const filteredDisputes = (disputes || []).filter(d => {
    const matchesFilter = filterStatus === 'All' || d.status === filterStatus;
    const matchesSearch =
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.subject.toLowerCase().includes(search.toLowerCase()) ||
      d.disputeType.toLowerCase().includes(search.toLowerCase()) ||
      (d.courseTitle && d.courseTitle.toLowerCase().includes(search.toLowerCase())) ||
      (d.raisedBy && d.raisedBy.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const openCount = (disputes || []).filter(d => d.status === 'Open').length;
  const underReviewCount = (disputes || []).filter(d => d.status === 'Under Review').length;
  const escalatedCount = (disputes || []).filter(d => d.status === 'Escalated').length;
  const resolvedCount = (disputes || []).filter(d => d.status === 'Resolved').length;

  const handleCreateDispute = async (e) => {
    e.preventDefault();
    if (!newDisputeForm.subject.trim()) {
      addToast('Please enter a dispute subject', 'error');
      return;
    }
    if (!newDisputeForm.description.trim()) {
      addToast('Please provide a detailed description of the dispute', 'error');
      return;
    }

    const selectedCourse = courses.find(c => c.id === newDisputeForm.courseId);

    try {
      const created = await raiseDispute({
        disputeType: newDisputeForm.disputeType,
        subject: newDisputeForm.subject,
        description: newDisputeForm.description,
        courseTitle: selectedCourse ? selectedCourse.title : 'Organization Platform Operations',
        courseId: newDisputeForm.courseId,
        priority: newDisputeForm.priority,
        raisedBy: info.name || 'NexusPay Enterprise Academy',
        raisedById: info.id || 'org-101',
        raisedByRole: newDisputeForm.raisedByRole,
        desiredResolution: newDisputeForm.desiredResolution
      });

      addToast(`Dispute ticket ${created?.id || 'DSP'} submitted to Governance Council!`, 'success');
      setShowRaiseModal(false);
      setNewDisputeForm({
        disputeType: 'Royalty Payout Discrepancy',
        subject: '',
        description: '',
        courseId: courses[0]?.id || '',
        priority: 'High',
        raisedByRole: 'Organization',
        desiredResolution: ''
      });
    } catch (err) {
      addToast(`Failed to raise dispute: ${err.message || 'Server error'}`, 'error');
    }
  };

  const handleResolve = async (d) => {
    try {
      await resolveDispute(d.id, adminNoteInput || 'Administrative review completed and settlement resolved.');
      addToast(`Dispute ${d.id} marked as Resolved!`, 'success');
      setSelectedDispute(null);
      setAdminNoteInput('');
    } catch (err) {
      addToast(`Failed to resolve dispute: ${err.message || 'Server error'}`, 'error');
    }
  };

  const handleEscalate = async (d) => {
    try {
      await updateDisputeStatus(d.id, 'Escalated', 'Escalated to NexusPay Global Compliance & Legal Council.');
      addToast(`Dispute ${d.id} escalated to Platform Legal & Governance!`, 'info');
      setSelectedDispute(null);
      setAdminNoteInput('');
    } catch (err) {
      addToast(`Failed to escalate dispute: ${err.message || 'Server error'}`, 'error');
    }
  };

  const handleUnderReview = async (d) => {
    try {
      await updateDisputeStatus(d.id, 'Under Review', 'Case accepted by Academic Dean for active investigation.');
      addToast(`Dispute ${d.id} status updated to Under Review!`, 'info');
      setSelectedDispute(null);
      setAdminNoteInput('');
    } catch (err) {
      addToast(`Failed to update dispute status: ${err.message || 'Server error'}`, 'error');
    }
  };

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Disputes & Governance' }]}
      actions={
        <button
          onClick={() => setShowRaiseModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Dispute</span>
        </button>
      }
    >
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Institutional Disputes & Governance</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Official dispute resolution tracking for faculty royalties, course content, academic integrity, and chargebacks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-xs font-bold text-on-surface">
              {disputes.length} Total Records
            </span>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Open Disputes</span>
            <p className="text-2xl font-black text-rose-600 mt-1">{openCount}</p>
            <span className="text-[11px] text-outline mt-0.5 block">Requires attention</span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Under Investigation</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{underReviewCount}</p>
            <span className="text-[11px] text-outline mt-0.5 block">Active dean review</span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Escalated Legal</span>
            <p className="text-2xl font-black text-purple-600 mt-1">{escalatedCount}</p>
            <span className="text-[11px] text-outline mt-0.5 block">Platform compliance</span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Resolved</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
            <span className="text-[11px] text-outline mt-0.5 block">Settled successfully</span>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 shadow-elevation-1 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Open', 'Under Review', 'Escalated', 'Resolved'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  filterStatus === tab
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dispute ID, subject, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
            />
          </div>
        </div>

        {/* Disputes Table / Case List */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">Dispute ID</th>
                  <th className="pb-3 font-bold">Dispute Type & Subject</th>
                  <th className="pb-3 font-bold">Raised By</th>
                  <th className="pb-3 font-bold">Associated Course</th>
                  <th className="pb-3 font-bold">Priority</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredDisputes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-outline">
                      No disputes found in this filter category.
                    </td>
                  </tr>
                ) : (
                  filteredDisputes.map((d) => {
                    const isOpen = d.status === 'Open';
                    const isReview = d.status === 'Under Review';
                    const isEscalated = d.status === 'Escalated';
                    const isResolved = d.status === 'Resolved';

                    return (
                      <tr key={d.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-4 font-mono font-bold text-primary whitespace-nowrap">
                          {d.id}
                        </td>
                        <td className="py-4 max-w-sm">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                              {d.disputeType}
                            </span>
                            <h3 className="font-bold text-sm text-on-surface line-clamp-1">{d.subject}</h3>
                            <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">{d.description}</p>
                          </div>
                        </td>
                        <td className="py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-surface-container text-primary font-bold flex items-center justify-center text-[10px]">
                              {d.raisedBy?.charAt(0) || 'U'}
                            </span>
                            <div>
                              <p className="font-bold text-xs text-on-surface">{d.raisedBy}</p>
                              <span className="text-[10px] text-outline">{d.raisedByRole || 'User'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 max-w-[200px] truncate text-on-surface font-medium">
                          {d.courseTitle || 'General Platform'}
                        </td>
                        <td className="py-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            d.priority === 'Urgent' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            d.priority === 'High' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {d.priority}
                          </span>
                        </td>
                        <td className="py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isOpen ? 'bg-rose-100 text-rose-800' :
                            isReview ? 'bg-amber-100 text-amber-900' :
                            isEscalated ? 'bg-purple-100 text-purple-900' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedDispute(d)}
                            className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs inline-flex items-center gap-1 transition-colors border border-outline-variant"
                          >
                            <span>Manage Case</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Raise New Dispute Form */}
        {showRaiseModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-elevation-3 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Raise Institutional Dispute</h2>
                    <p className="text-xs text-on-surface-variant">Submit a formal governance ticket for administrative investigation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRaiseModal(false)}
                  className="p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDispute} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1">Dispute Classification Type</label>
                    <select
                      value={newDisputeForm.disputeType}
                      onChange={(e) => setNewDisputeForm({ ...newDisputeForm, disputeType: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
                    >
                      {disputeCategories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1">Priority Level</label>
                    <select
                      value={newDisputeForm.priority}
                      onChange={(e) => setNewDisputeForm({ ...newDisputeForm, priority: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
                    >
                      <option value="Urgent">Urgent (Immediate Review)</option>
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Associated Course Catalog Track</label>
                  <select
                    value={newDisputeForm.courseId}
                    onChange={(e) => setNewDisputeForm({ ...newDisputeForm, courseId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.category})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Dispute Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Discrepancy in Q3 corporate cohort royalty allocation"
                    value={newDisputeForm.subject}
                    onChange={(e) => setNewDisputeForm({ ...newDisputeForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Detailed Description of Issue & Evidence</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide specific details, dates, transaction IDs, code modules, or discrepancies..."
                    value={newDisputeForm.description}
                    onChange={(e) => setNewDisputeForm({ ...newDisputeForm, description: e.target.value })}
                    className="w-full p-3 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Desired Resolution / Remediation</label>
                  <input
                    type="text"
                    placeholder="e.g. Recalculate faculty payout statement and issue settlement adjustment"
                    value={newDisputeForm.desiredResolution}
                    onChange={(e) => setNewDisputeForm({ ...newDisputeForm, desiredResolution: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowRaiseModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Formal Dispute</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Manage Dispute Case File */}
        {selectedDispute && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-elevation-3 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between pb-4 border-b border-outline-variant">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-[11px] font-bold">
                      {selectedDispute.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedDispute.status === 'Open' ? 'bg-rose-100 text-rose-800' :
                      selectedDispute.status === 'Under Review' ? 'bg-amber-100 text-amber-900' :
                      selectedDispute.status === 'Escalated' ? 'bg-purple-100 text-purple-900' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedDispute.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-on-surface mt-1.5">{selectedDispute.subject}</h2>
                  <p className="text-xs text-outline">Logged on {selectedDispute.createdAt} • Raised by {selectedDispute.raisedBy}</p>
                </div>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Case Details */}
              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-outline">Incident Facts & Summary</span>
                  <p className="text-on-surface font-medium leading-relaxed">{selectedDispute.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant">
                    <span className="text-[10px] uppercase font-bold text-outline block">Classification</span>
                    <p className="font-bold text-primary mt-0.5">{selectedDispute.disputeType}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant">
                    <span className="text-[10px] uppercase font-bold text-outline block">Course Scope</span>
                    <p className="font-bold text-on-surface mt-0.5 truncate">{selectedDispute.courseTitle || 'Global'}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant space-y-1">
                  <span className="text-[10px] uppercase font-bold text-outline">Desired Resolution</span>
                  <p className="text-on-surface font-medium">{selectedDispute.desiredResolution || 'Administrative review & resolution.'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-900">Governance Audit Notes</span>
                  <p className="text-blue-950 font-medium">{selectedDispute.adminNotes || 'Under active governance assessment.'}</p>
                </div>

                {/* Status Update Actions */}
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-on-surface block mb-1">Add Administrative Action Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter audit finding, settlement voucher #, or rationale..."
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl text-on-surface font-medium focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-outline-variant">
                <div className="flex items-center gap-2">
                  {selectedDispute.status !== 'Under Review' && selectedDispute.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUnderReview(selectedDispute)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors"
                    >
                      Investigate (Under Review)
                    </button>
                  )}
                  {selectedDispute.status !== 'Escalated' && (
                    <button
                      onClick={() => handleEscalate(selectedDispute)}
                      className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-colors"
                    >
                      Escalate to Legal
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDispute(null)}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors"
                  >
                    Close
                  </button>
                  {selectedDispute.status !== 'Resolved' && (
                    <button
                      onClick={() => handleResolve(selectedDispute)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark as Resolved</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </OrgLayout>
  );
}
