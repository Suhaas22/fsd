import { useRemoteData } from '../../hooks/useRemoteData';
import CertificateModal from '../../components/common/CertificateModal';
import React, { useEffect, useState } from 'react';
import { Award, BookOpen, ArrowUpRight } from 'lucide-react';
import { api, getItems } from '../../utils/api';
import {
  AdminHeader,
  AdminSearch,
  AdminEmpty,
} from '../../components/admin/AdminUI';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import '../../styles/admin-panels.css';

const PAGE_SIZE = 10;
export const Certificates = () => {
  const remote = useRemoteData('/certificates');
  const certificates = getItems(remote.data);
  const loading = remote.loading;
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setPage(1);
  }, [search]);
  async function view(row) {
    setError('');
    setBusy(true);
    try {
      setSelected(await api.get(`/certificates/${encodeURIComponent(row.id)}`));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const filtered = certificates.filter((cert) =>
    [
      cert.learnerName,
      cert.learnerEmail,
      cert.courseTitle,
      cert.credentialId,
      cert.id,
    ].some((value) =>
      String(value || '')
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  return (
    <div className="admin-page">
      <AdminHeader
        eyebrow="Learning achievements"
        title="Certificates"
        description="Every learner, course, and earned credential."
      />
      {(error || remote.error) && (
        <p
          role="alert"
          className="admin-alert"
        >
          {error || remote.error}
        </p>
      )}
      <div className="admin-toolbar">
        <AdminSearch
          label="Search certificates"
          value={search}
          onChange={setSearch}
          placeholder="Search learner, email, course or credential…"
        />
        <span className="admin-count-label">
          {loading ? 'Loading…' : `${filtered.length} credentials`}
        </span>
      </div>
      {loading ? (
        <div className="admin-card admin-empty">
          <p className="admin-muted">Loading certificates…</p>
        </div>
      ) : (
        !error &&
        !remote.error && (
          <>
            <div className="admin-grid">
              {filtered
                .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                .map((cert) => (
                  <article
                    className="admin-card admin-record"
                    key={cert.id}
                  >
                    <div className="admin-record-top">
                      <span className="admin-icon-tile admin-icon-amber">
                        <Award size={22} />
                      </span>
                      <StatusBadge status={cert.status} />
                    </div>
                    <p className="admin-record-category">
                      Certificate of completion
                    </p>
                    <h2 className="text-sm font-semibold mt-2">
                      {cert.learnerName || 'Name not recorded'}
                    </h2>
                    <p className="admin-record-meta break-all">
                      {cert.learnerEmail || 'Email not recorded'}
                    </p>
                    <div className="flex gap-2 mt-5 mb-5 rounded-xl bg-[#f6f8f2] p-3">
                      <BookOpen
                        size={15}
                        className="shrink-0 mt-0.5"
                      />
                      <p className="text-xs leading-5">
                        {cert.courseTitle || 'Course not recorded'}
                      </p>
                    </div>
                    <div className="admin-record-footer">
                      <span className="admin-record-code">
                        {cert.credentialId || cert.id}
                      </span>
                      <button
                        className="admin-button"
                        disabled={busy}
                        onClick={() => view(cert)}
                      >
                        View
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </article>
                ))}
            </div>
            {!filtered.length && (
              <AdminEmpty
                icon={Award}
                title="No certificates found"
                description="Earned credentials will appear here. Try a different search."
              />
            )}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )
      )}

      {selected && (
        <CertificateModal
          certificate={selected}
          administrator
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};
