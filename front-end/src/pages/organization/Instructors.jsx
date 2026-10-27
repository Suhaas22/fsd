import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight,Plus,BookOpen,Users} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import {useRemoteData} from '../../hooks/useRemoteData';
import {AdminHeader,AdminSearch,AdminDataState,AdminEmpty} from '../../components/admin/AdminUI';
import {StatusBadge} from '../../components/admin/StatusBadge';
export default function Instructors(){
 const state=useRemoteData('/workspace/organization/teaching-assignments'),[search,setSearch]=useState('');
 const rows=state.data?.items.filter(i=>`${i.name} ${i.email} ${i.specialization||''}`.toLowerCase().includes(search.toLowerCase()))||[];
 return <OrgLayout><div className="admin-page"><AdminHeader title="Instructors"><Link to="/org/instructor-requests" className="admin-button admin-button-primary"><Plus size={15}/>Invite instructor</Link></AdminHeader><div className="admin-toolbar"><AdminSearch value={search} onChange={setSearch} placeholder="Search instructors…"/><span className="admin-count-label">{state.data?`${rows.length} instructors`:''}</span></div><AdminDataState {...state}/><div className="org-faculty-grid">{rows.map(i=><article className="admin-card org-faculty-card" key={i.id}><div className="org-faculty-top"><span className="org-faculty-monogram">{i.name?.split(' ').map(w=>w[0]).slice(0,2).join('')}</span><StatusBadge status={i.status}/></div><Link className="org-faculty-name" to={`/org/instructors/${i.id}`}><h2>{i.name}</h2></Link><p className="org-faculty-email">{i.email}</p>{i.specialization&&<p className="org-faculty-specialty">{i.specialization}</p>}<dl className="org-faculty-metrics"><div><dt><BookOpen size={14}/>Assigned courses</dt><dd>{i.courses.length}</dd></div><div><dt><Users size={14}/>Enrollments</dt><dd>{i.totalEnrollments}</dd></div></dl><footer><Link className="admin-button" to={`/org/instructors/${i.id}`}>View instructor<ArrowUpRight size={14}/></Link>{i.status==='Active'?<Link className="org-faculty-assign" to={`/org/courses/assign?instructorId=${i.id}`}>Assign course<Plus size={14}/></Link>:<span className="admin-muted">Assignment disabled</span>}</footer></article>)}</div>{!state.loading&&!state.error&&!rows.length&&<AdminEmpty title="No associated instructors match"/>}</div></OrgLayout>;
}
