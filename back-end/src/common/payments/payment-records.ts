import { JsonDatabaseService } from '../../database/json-db.service';
export const completedPaymentStatus=(status:any)=>['completed','paid','success','successful'].includes(String(status).toLowerCase());
export async function paymentRecords(db:JsonDatabaseService){
 const [rows,courses,learners,orgs,enrollments]=await Promise.all(['transactions','courses','learners','organizations','enrollments'].map(n=>db.getCollection<any>(n)));
 return rows.filter(t=>String(t.type).toLowerCase()!=='refund'&&String(t.status).toLowerCase()!=='refunded').map(t=>{
  const learner=learners.find(l=>[l.id,l.userId].filter(Boolean).some(id=>[t.payerId,t.learnerId,t.userId].includes(id))||t.payerEmail&&l.email?.toLowerCase()===t.payerEmail.toLowerCase());
  const course=courses.find(c=>c.id===t.courseId);const organizationId=t.organizationId||course?.organizationId||null;const org=orgs.find(o=>o.id===organizationId);const aliases=learner?[learner.id,learner.userId].filter(Boolean):[];
  const enrollment=enrollments.find(e=>e.courseId===t.courseId&&[e.learnerId,e.userId].some(id=>aliases.includes(id)));
  const amount=t.amount!==null&&t.amount!==undefined&&t.amount!==''&&Number.isFinite(Number(t.amount))?Number(t.amount):null;
  const code=String(t.currency||'').toUpperCase();const type=String(t.type).toLowerCase();
  return {...t,type:type==='payment'?'Payment':type==='payout'?'Payout':t.type,amount,currency:/^[A-Z]{3}$/.test(code)?code:null,payer:learner?.name||t.payer||t.payerName||t.learnerName||null,learnerId:learner?.id||t.learnerId||null,course:course?.title||t.course||t.courseTitle||null,recordedCourseTitle:t.course||t.courseTitle||null,organizationId,organizationName:org?.name||t.organizationName||null,method:t.method||t.paymentMethod||t.paymentGateway||null,courseAvailable:!!course&&course.status==='Published',courseStatus:course?.status||null,enrollmentId:enrollment?.id||null};
 }).sort((a,b)=>(Date.parse(b.createdAt||b.date)||0)-(Date.parse(a.createdAt||a.date)||0));
}
