import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import OrgLayout from '../../components/organization/OrgLayout';
import {useRemoteData} from '../../hooks/useRemoteData';
import {api} from '../../services/api';
import {AdminHeader,AdminSearch,AdminDataState,AdminEmpty} from '../../components/admin/AdminUI';
import {StatusBadge} from '../../components/admin/StatusBadge';
export default function Instructors(){
 const state=useRemoteData('/workspace/organization/teaching-assignments'),[search,setSearch]=useState(''),[busy,setBusy]=useState(''),[error,setError]=useState('');
 async function toggle(i){setBusy(i.id);setError('');try{await api.patch(`/instructors/${i.id}`,{status:i.status==='Suspended'?'Active':'Suspended'});state.refresh();window.dispatchEvent(new Event('learning-data-changed'));}catch(e){setError(e.message);}finally{setBusy('');}}
 const rows=state.data?.items.filter(i=>`${i.name} ${i.email} ${i.specialization||''}`.toLowerCase().includes(search.toLowerCase()))||[];
 return <OrgLayout><div className="admin-page"><AdminHeader title="Instructors"><Link to="/org/instructor-requests" className="admin-button">Invite instructor</Link></AdminHeader><AdminDataState {...state}/><div className="admin-toolbar"><AdminSearch value={search} onChange={setSearch} placeholder="Search instructors…"/></div>{error&&<p role="alert" className="workspace-error">{error}</p>}<div className="admin-grid">{rows.map(i=><article className="admin-card admin-record" key={i.id}><div className="flex justify-between gap-3"><h2 className="text-base font-semibold">{i.name}</h2><StatusBadge status={i.status}/></div><p className="admin-muted mt-3">{i.email}</p><p className="admin-muted mt-3">{i.specialization}</p><dl className="finance-breakdown"><div><dt>Assigned courses</dt><dd>{i.courses.length}</dd></div><div><dt>Total enrollments</dt><dd>{i.totalEnrollments}</dd></div></dl><div className="flex flex-wrap gap-2 mt-5"><Link className="admin-button" to={`/org/instructors/${i.id}`}>View details</Link>{i.status==='Active'?<Link className="admin-button" to={`/org/courses/assign?instructorId=${i.id}`}>Assign course</Link>:<button className="admin-button" disabled>Assignment disabled</button>}<button className="admin-button" disabled={!!busy} onClick={()=>toggle(i)}>{busy===i.id?'Saving…':i.status==='Suspended'?'Make active':'Suspend'}</button></div></article>)}</div>{!state.loading&&!state.error&&!rows.length&&<AdminEmpty title="No associated instructors match"/>}</div></OrgLayout>;
}
