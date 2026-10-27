import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import OrgLayout from '../organization/OrgLayout';
import {useRemoteData} from '../../hooks/useRemoteData';
import {useDebouncedValue} from '../../hooks/useDebouncedValue';
import {AdminHeader,AdminDataState,AdminSearch,AdminEmpty} from '../admin/AdminUI';
import {timestampLabel} from '../../utils/adminDisplay';
export default function Logs({organization=false}){
 const [search,setSearch]=useState(''),[category,setCategory]=useState(''),[page,setPage]=useState(1);const settled=useDebouncedValue(search);
 const state=useRemoteData(`/workspace/logs?${new URLSearchParams({search:settled,category,page})}`),data=state.data;
 function filter(set,value){set(value);setPage(1);}
 const content=<div className="admin-page"><AdminHeader title="Logs"/><div className="admin-toolbar"><AdminSearch value={search} onChange={v=>filter(setSearch,v)} placeholder="Search actions, people or courses…"/><select className="admin-input" aria-label="Log category" value={category} onChange={e=>filter(setCategory,e.target.value)}><option value="">All activity</option><option value="instructor">Instructor activity</option><option value="learner">Learner activity</option><option value="admin">Administration</option><option value="payment">Payments</option></select></div><AdminDataState {...state}/>{data&&!state.error&&<><section className="admin-card"><div className="admin-section-header"><h2>Activity history</h2><span>{data.total} records</span></div><div className="operations-table-scroll"><table className="operations-table"><thead><tr><th>Action</th><th>Actor</th><th>Category</th><th>Time</th></tr></thead><tbody>{data.items.map(r=><tr key={r.id}><td><Link className="operations-log-link" to={r.href}><strong>{r.title}</strong><small>{r.details}</small></Link></td><td>{r.actorName}<small>{r.actorRole}</small></td><td>{r.category}</td><td className="whitespace-nowrap">{timestampLabel(r.createdAt)}</td></tr>)}</tbody></table></div>{!data.items.length&&<AdminEmpty title="No logs match these filters"/>}</section><div className="flex items-center justify-between gap-4"><button className="admin-button" disabled={page<=1||state.loading} onClick={()=>setPage(p=>p-1)}>Previous</button><span className="admin-muted">Page {data.page} of {data.totalPages}</span><button className="admin-button" disabled={page>=data.totalPages||state.loading} onClick={()=>setPage(p=>p+1)}>Next</button></div></>}</div>;
 return organization?<OrgLayout>{content}</OrgLayout>:content;
}
