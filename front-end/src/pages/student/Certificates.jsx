import {downloadCertificate} from '../../utils/certificateDownload';
import { AdminDataState } from '../../components/admin/AdminUI';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, ExternalLink, Search, CheckCircle,Download } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import CertificateModal from '../../components/common/CertificateModal';
import { useStudent } from '../../context/StudentContext';

export default function Certificates() {
  const { certificates, enrollments, isLoading, refreshData, error } = useStudent();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [downloading,setDownloading]=useState('');const [downloadError,setDownloadError]=useState('');
  async function download(c){setDownloading(c.id);setDownloadError('');try{await downloadCertificate(c);}catch(e){setDownloadError(e.message);}finally{setDownloading('');}}

  useEffect(() => {
    document.title = 'Certificates | Acadex';
    refreshData();
  }, [refreshData]);

  const completedCount = enrollments.filter((e) => e.status === 'Completed').length;
  const skills = useMemo(() => new Set(certificates.flatMap((c) => c.skills || [])), [certificates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return certificates.filter(
      (c) => !q || [c.courseTitle, c.credentialId, c.institution, ...(c.skills || [])].some((v) => v?.toLowerCase().includes(q))
    );
  }, [certificates, query]);

  return (
    <PageLayout>
      {error&&<div className="learner-page"><AdminDataState error={error.message||String(error)} refresh={refreshData}/></div>}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Certificates</h1>
        </header>

        {downloadError&&<p className="workspace-error" role="alert">{downloadError}</p>}
        <div className="grid grid-cols-3 gap-4">
          {[
            ['Certificates earned', certificates.length],
            ['Courses completed', completedCount],
            ['Skills covered', skills.size],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {certificates.length > 0 && (
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by course, credential ID or skill"
              className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0056D2]"
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0056D2] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              {certificates.length === 0 ? 'No certificates yet' : 'No certificates match your search'}
            </p>
            {certificates.length === 0 && (
              <p className="text-xs text-slate-500 mt-1">
                Finish all lessons in an enrolled course to earn one.{' '}
                <Link to="/student/my-learning" className="text-[#0056D2] font-bold hover:underline">
                  Go to my learning
                </Link>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-200 relative flex flex-col items-center justify-center p-6 text-center">
                  <Award className="w-10 h-10 text-[#0056D2]/30 mb-1" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Certificate of completion</span>
                  <span className="text-xs font-bold text-slate-700 line-clamp-2 mt-1">{c.courseTitle}</span>
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {c.status}
                  </span>
                </div>
                <div className="p-4 flex-1 space-y-1">
                  {c.institution && <p className="text-xs font-semibold text-slate-500">{c.institution}</p>}
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{c.courseTitle}</h3>
                  <p className="text-xs text-slate-400">Issued {c.issueDate}</p>
                </div>
                <div className="border-t border-slate-100 px-4 py-3 flex flex-wrap gap-3 justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-mono">{c.credentialId}</span>
                  <div className="flex gap-3 items-center"><button type="button" disabled={!!downloading} onClick={()=>download(c)} className="admin-button"><Download size={14}/>{downloading===c.id?'Downloading…':'Download'}</button><button onClick={() => setSelected(c)} className="text-xs font-bold text-[#0056D2] hover:underline flex items-center gap-1">
                    View <ExternalLink className="w-3.5 h-3.5" />
                  </button></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selected && <CertificateModal certificate={selected} onClose={() => setSelected(null)} />}
    </PageLayout>
  );
}
