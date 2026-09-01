import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  Share2, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/common/Badge';
import CertificateModal from '../../components/common/CertificateModal';
import api from '../../services/api';

export default function Certificates() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCert, setSelectedCert] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.student.getCertificates('lrn-1')
      .then((res) => {
        setCertificates(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch certificates:', err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', 'Professional Certificates', 'Course Certificates', 'Specializations'];

  const filteredCerts = certificates.filter((cert) => {
    if (activeCategory === 'All') return true;
    return cert.category === activeCategory;
  });

  return (
    <PageLayout>
      <div className="w-full max-w-[1680px] mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-headline-lg font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
              My Verified Credentials & Certificates ({certificates.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cryptographically verified credentials recognized across global financial technology enterprises
            </p>
          </div>

          {certificates.length > 0 && (
            <button
              onClick={() => setSelectedCert(certificates[0])}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-sm transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Preview Latest Certificate</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{certificates.length} Certificates</h3>
              <p className="text-xs text-slate-500 mt-0.5">Earned & Verified</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">142 Hours</h3>
              <p className="text-xs text-slate-500 mt-0.5">Total Dedicated Learning</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Verified</h3>
              <p className="text-xs text-slate-500 mt-0.5">On-chain Credential Hash</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading verified credentials from backend...</div>
        ) : filteredCerts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No certificates in this view</p>
            <p className="text-xs text-slate-400 mt-1">Complete your active enrolled tracks to earn verified certificates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCerts.map((cert) => (
              <div key={cert.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm">Stanford University</Badge>
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                    {cert.courseTitle || cert.title || 'Advanced Enterprise Architecture Certificate'}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium">
                    Issued to <strong className="text-slate-800">Alex Chen</strong> on {cert.issueDate || 'August 2026'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {cert.credentialId || cert.id}</span>
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold transition-colors"
                  >
                    <span>View Credentials</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {selectedCert && (
        <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </PageLayout>
  );
}
