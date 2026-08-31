import React, { useState } from 'react';
import { 
  Award, 
  Clock, 
  Sparkles, 
  Share2, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2,
  Filter,
  Plus
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/common/Badge';
import CertificateModal from '../../components/common/CertificateModal';
import { certificatesData } from '../../data/certificatesData';

export default function Certificates() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCert, setSelectedCert] = useState(null);

  const categories = ['All', 'Professional Certificates', 'Course Certificates', 'Specializations'];

  const filteredCerts = certificatesData.certificates.filter(cert => {
    if (activeCategory === 'All') return true;
    return cert.category === activeCategory;
  });

  return (
    <PageLayout>
      <div className="w-full max-w-[1680px] mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
        
        {/* Header Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-headline-lg font-black text-2xl md:text-3xl text-on-surface tracking-tight">
              My Verified Credentials & Certificates ({certificatesData.totalEarned})
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Cryptographically verified credentials recognized across global financial technology enterprises
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCert(certificatesData.certificates[0])}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-sm transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Preview Latest Certificate</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-ambient flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center font-bold text-xl shadow-xs">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs text-outline font-bold uppercase tracking-wider">Total Earned</span>
              <h3 className="text-2xl font-black text-on-surface">{certificatesData.totalEarned} Certificates</h3>
              <p className="text-xs text-secondary font-bold">100% Cryptographically Verified</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-ambient flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
              <Clock className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <span className="text-xs text-outline font-bold uppercase tracking-wider">Time Invested</span>
              <h3 className="text-2xl font-black text-on-surface">{certificatesData.hoursLearned} Hours</h3>
              <p className="text-xs text-outline font-medium">Across 8 specialization tracks</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-ambient flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shadow-xs">
              <Sparkles className="w-8 h-8 text-tertiary" />
            </div>
            <div>
              <span className="text-xs text-outline font-bold uppercase tracking-wider">Skills Validated</span>
              <h3 className="text-2xl font-black text-on-surface">{certificatesData.skillsGained} Skills</h3>
              <p className="text-xs text-outline font-medium">Recognized by Fortune 500 tech firms</p>
            </div>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-variant scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Certificates Grid (3-4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
          {filteredCerts.map((cert) => (
            <div
              key={cert.id}
              className="bg-surface-container-lowest border border-outline-variant/80 rounded-3xl overflow-hidden shadow-ambient hover:shadow-elevation-2 hover:-translate-y-1 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Certificate Banner Preview */}
                <div className="relative h-48 w-full bg-surface-container overflow-hidden">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="success" size="sm">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Credential</span>
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {cert.institution}
                  </span>
                  <h3 className="font-title-lg text-lg font-bold text-on-surface mt-1 mb-2 line-clamp-2 leading-snug">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-outline mb-4">
                    Issued: <strong className="text-on-surface-variant font-medium">{cert.issueDate}</strong> • Grade: <strong className="text-secondary font-bold">{cert.grade}</strong>
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {cert.skills?.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-md bg-surface-container text-[11px] font-bold text-on-surface-variant">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-outline-variant/60 flex items-center justify-between gap-2.5">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Diploma</span>
                  </button>

                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface-variant transition-colors"
                    title="Share to LinkedIn"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="p-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface-variant transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Certificate Modal Lightbox */}
        {selectedCert && (
          <CertificateModal
            certificate={selectedCert}
            onClose={() => setSelectedCert(null)}
          />
        )}

      </div>
    </PageLayout>
  );
}
