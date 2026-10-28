import React from 'react';
import { useRemoteData } from '../../hooks/useRemoteData';
import { AdminDataState } from '../admin/AdminUI';
import { StatusBadge } from '../admin/StatusBadge';
import { timestampLabel } from '../../utils/adminDisplay';
export default function LoggedModuleRequest({ id }) {
  const state = useRemoteData(
      `/workspace/logs/requests/${encodeURIComponent(id)}`
    ),
    r = state.data;
  return (
    <section className="admin-card operations-request" id={`request-${id}`}>
      <h2 className="text-base font-semibold mb-4">Curriculum request</h2>
      <AdminDataState {...state} />
      {r && !state.error && (
        <>
          <div className="flex justify-between gap-4">
            <p>
              {r.instructorName} · {timestampLabel(r.createdAt)}
            </p>
            <StatusBadge status={r.status} />
          </div>
          {r.modules.map((m, i) => (
            <article className="finance-summary-card mt-4" key={m.id || i}>
              <h3>{m.title}</h3>
              {(Array.isArray(m.items)
                ? m.items
                : Array.isArray(m.lessons)
                  ? m.lessons
                  : []
              ).map((l, n) => (
                <p className="admin-muted mt-2" key={l.id || n}>
                  {l.title} · {l.type}
                </p>
              ))}
            </article>
          ))}
          {r.note && <p className="admin-muted mt-4">Review note: {r.note}</p>}
        </>
      )}
    </section>
  );
}
