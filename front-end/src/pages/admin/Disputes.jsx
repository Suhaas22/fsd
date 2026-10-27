import {useSearchParams} from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock3, CircleCheck, CircleX, ArrowUpRight, CalendarDays, UserRound } from 'lucide-react';
import { api } from '../../utils/api';
import { useRemoteData } from '../../hooks/useRemoteData';
import { AdminHeader, AdminMetric, AdminSearch, AdminEmpty, AdminDataState } from '../../components/admin/AdminUI';
import { DisputeDetailDrawer } from '../../components/admin/DisputeDetailDrawer';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Pagination } from '../../components/admin/Pagination';
import { dateLabel } from '../../utils/adminDisplay';
export const Disputes = () => {
    const [params]=useSearchParams();
    const disputeId=params.get('disputeId');
    const state = useRemoteData('/disputes?limit=1000');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [opening, setOpening] = useState('');
    const [error, setError] = useState('');
    useEffect(()=>{if(!disputeId)return;let active=true;api.get(`/disputes/${encodeURIComponent(disputeId)}`).then(row=>{if(active)setSelected(row);}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[disputeId]);
    const records = Array.isArray(state.data) ? state.data : state.data?.items || [];
    const filtered = records.filter(d => (!status || d.status === status) && [d.id, d.subject, d.description, d.raisedBy, d.raisedByName].some(v => String(v || '').toLowerCase().includes(search.toLowerCase())));
    async function view(row) { setOpening(row.id); setError(''); try {
        setSelected(await api.get(`/disputes/${row.id}`));
    }
    catch (e) {
        setError(e.message);
    }
    finally {
        setOpening('');
    } }
    return <div className="admin-page">
    <AdminHeader eyebrow="Platform operations" title="Disputes" description="Listen, review, and resolve issues across your learning community."/>{state.data && !state.error && <div className="admin-stats-grid">
        <AdminMetric icon={MessageSquare} label="Total disputes" value={records.length}/>
        <AdminMetric icon={Clock3} label="Awaiting resolution" value={records.filter(d => ['Open', 'Pending', 'In Progress', 'Under Review', 'Escalated'].includes(d.status)).length} accent="amber"/>
        <AdminMetric icon={CircleCheck} label="Resolved" value={records.filter(d => d.status === 'Resolved').length} accent="blue"/>
        <AdminMetric icon={CircleX} label="Rejected" value={records.filter(d => d.status === 'Rejected').length} accent="rose"/>
        </div>}<div className="admin-toolbar">
    <AdminSearch value={search} onChange={v => { setSearch(v); setPage(1); }} label="Search disputes" placeholder="Search subject, person or dispute ID…"/>
    <select value={status} aria-label="Dispute status" onChange={e => { setStatus(e.target.value); setPage(1); }}>
    <option value="">All statuses</option>{[...new Set(records.map(d => d.status).filter(Boolean))].map(s => <option key={s}>{s}</option>)}</select>
    </div>{error && <p className="admin-alert" role="alert">{error}</p>}<AdminDataState {...state}/>{!state.loading && !state.error && <>
        <p className="admin-count-label">
        <b>{filtered.length}</b> disputes found</p>
        <div className="admin-grid">{filtered.slice((page - 1) * 9, page * 9).map(d => <article className="admin-card admin-record" key={d.id}>
            <div className="admin-record-top">
            <span className="admin-icon-tile admin-icon-amber">
            <MessageSquare size={19}/>
            </span>
            <StatusBadge status={d.status}/>
            </div>
            <p className="admin-record-category">{d.type || 'General issue'}</p>
            <h2 className="text-sm font-semibold mt-2 leading-6">{d.subject || 'Subject not recorded'}</h2>
            <p className="admin-record-meta line-clamp-2">{d.description || 'Open this dispute to see its details.'}</p>
            <p className="admin-record-meta mt-4">
            <UserRound size={13}/>{d.raisedByName || d.raisedBy || 'Name not recorded'}</p>
            <p className="admin-record-meta">
            <CalendarDays size={13}/>{dateLabel(d.createdAt || d.date)}</p>
            <div className="admin-record-footer mt-5">
            <span className="admin-record-code">{d.id}</span>
            <button className="admin-button" disabled={!!opening} onClick={() => view(d)}>{opening === d.id ? 'Opening…' : 'View details'}<ArrowUpRight size={14}/>
            </button>
            </div>
            </article>)}</div>{!filtered.length && <AdminEmpty icon={MessageSquare} title="No disputes found" description="Try another search or select a different status."/>}<Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(filtered.length / 9))} onPageChange={setPage}/>
        </>}{selected && <DisputeDetailDrawer key={selected.id} dispute={selected} onClose={() => setSelected(null)} onUpdated={updated => { setSelected(updated); state.refresh(); }}/>}</div>;
};
