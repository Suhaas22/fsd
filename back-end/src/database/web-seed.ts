import {publishedLessons} from '../common/learning/learning-records';
// The JSON files are read-only starting records for the web demo.
// Changes made through the website live in the shared backend store.
export function prepareWebSeed(snapshot:Record<string,any[]>):Record<string,any[]>{
 const clean=(value:any):any=>Array.isArray(value)?value.map(clean):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,/avatar|profilePhoto/i.test(key)?null:clean(item)])):value;
 const data=clean(snapshot);const teachers=data.instructors||[];
 // Keep a small starting catalog before rebuilding the bundled demo relationships.
 const currentDemoCourses=new Set(['cou-50d09a28','cou-fb5ac543','cou-2238c587']);
 for(const course of data.courses||[]){
  // Older sample courses stay outside the current learner catalog.
  if(/^crs-/.test(course.id)||(/^cou-/.test(course.id)&&course.status==='Published'&&!currentDemoCourses.has(course.id)))course.status='Archived';
  const requested=[course.instructorId,...(course.coInstructorIds||[]),...(course.instructors||[]).map(i=>typeof i==='string'?i:i.id)];
  const eligible=teachers.filter(i=>i.organizationId===course.organizationId&&i.status==='Active');
  let team=eligible.filter(i=>requested.includes(i.id));if(!team.length&&eligible.length)team=[eligible[0]];
  const lead=team.find(i=>i.id===course.instructorId)||team[0];
  course.instructorId=lead?.id||null;course.instructors=team.map(i=>({id:i.id,name:i.name,email:i.email,role:i.id===lead?.id?'Lead Instructor':'Co-Instructor'}));course.coInstructorIds=team.filter(i=>i.id!==lead?.id).map(i=>i.id);course.instructorName=team.map(i=>i.name).join(', ');course.leadInstructorName=lead?.name||null;
 }
 // Reset only the bundled demo dataset; custom datasets are left intact.
 if((data.learners||[]).some(l=>l.id==='lrn-1')&&[...currentDemoCourses].every(id=>(data.courses||[]).some(c=>c.id===id)))synchronizeDemoRecords(data,currentDemoCourses);
 return data;
}

function synchronizeDemoRecords(data:Record<string,any[]>, current:Set<string>){
 const courses=data.courses||[],learners=data.learners||[];
 const learnerFor=(id:string)=>learners.find(l=>l.id===id||l.userId===id);
 const candidates=(data.enrollments||[]).filter(e=>current.has(e.courseId)&&learnerFor(e.learnerId||e.userId)&&['Active','Completed'].includes(e.status));
 const enrollments:any[]=[];
 for(const learner of learners){
  const own=candidates.filter(e=>learnerFor(e.learnerId||e.userId)?.id===learner.id);
  const selected=[own.find(e=>e.status==='Active'),own.find(e=>e.status==='Completed')].filter(Boolean);
  for(const e of own)if(selected.length<2&&!selected.some(other=>other.courseId===e.courseId))selected.push(e);
  for(const e of selected){
   const course=courses.find(c=>c.id===e.courseId);const completed=e.status==='Completed';
   enrollments.push({...e,learnerId:learner.id,learnerName:learner.name,learnerEmail:learner.email,courseTitle:course.title,
    organizationId:course.organizationId,status:completed?'Completed':'Active',progress:completed?100:0,
    completedLessons:completed?publishedLessons(course).map(l=>l.id):[]});
  }
 }
 const pair=(learnerId:string,courseId:string)=>enrollments.find(e=>e.learnerId===learnerFor(learnerId)?.id&&e.courseId===courseId);
 const transactions:any[]=[];
 for(const e of enrollments){
  const course=courses.find(c=>c.id===e.courseId),learner=learnerFor(e.learnerId);
  if(Number(course.price)>0){
   const existing=(data.transactions||[]).find(t=>String(t.type).toLowerCase()==='payment'&&t.courseId===course.id&&['completed','paid','success','successful'].includes(String(t.status).toLowerCase())&&([learner.id,learner.userId].some(id=>id&&[t.payerId,t.learnerId,t.userId].includes(id))||t.payerEmail&&t.payerEmail.toLowerCase()===learner.email?.toLowerCase()));
   transactions.push({...existing,id:existing?.id||`demo-payment-${e.id}`,type:'Payment',status:'Completed',payerId:learner.id,learnerId:learner.id,
    payer:learner.name,payerEmail:learner.email,courseId:course.id,course:course.title,courseTitle:course.title,enrollmentId:e.id,
    organizationId:course.organizationId,amount:Number(course.price),currency:course.currency||'INR',
    method:existing?.method||'Demo',createdAt:existing?.createdAt||e.enrolledAt||e.createdAt||'2026-10-01T00:00:00.000Z',isDemo:true});
  }
 }
 data.enrollments=enrollments;data.transactions=transactions;
 data.certificates=enrollments.filter(e=>e.status==='Completed').map(e=>{
  const learner=learnerFor(e.learnerId),course=courses.find(c=>c.id===e.courseId);
  const existing=(data.certificates||[]).find(c=>pair(c.learnerId,c.courseId)?.id===e.id);
  const org=(data.organizations||[]).find(o=>o.id===course.organizationId);
  const cert={...existing,id:existing?.id||`demo-certificate-${e.id}`,credentialId:existing?.credentialId||`DEMO-${e.id}`,learnerId:learner.id,
   learnerName:learner.name,learnerEmail:learner.email,courseId:course.id,courseTitle:course.title,organizationId:course.organizationId,
   institution:org?.name||'',instructorName:course.instructorName||'',category:course.category||'',status:'Verified',grade:'Completed',
   issuedAt:existing?.issuedAt||e.completedAt||e.enrolledAt||'2026-10-01T00:00:00.000Z',isDemo:true};
  e.certificateId=cert.credentialId;return cert;
 });
 for(const e of enrollments)if(e.status!=='Completed')delete e.certificateId;
 const seenReviews=new Set<string>();
 data.reviews=(data.reviews||[]).filter(r=>{
  const enrollment=pair(r.learnerId,r.courseId),key=`${enrollment?.learnerId}:${r.courseId}`;
  if(!enrollment||seenReviews.has(key)||!Number.isInteger(Number(r.rating))||Number(r.rating)<1||Number(r.rating)>5)return false;
  seenReviews.add(key);return true;
 }).map(r=>({...r,learnerId:learnerFor(r.learnerId).id,learnerName:learnerFor(r.learnerId).name,courseTitle:courses.find(c=>c.id===r.courseId).title}));
 data.disputes=(data.disputes||[]).filter(d=>{
  const learner=learnerFor(d.learnerId||d.raisedById);
  return !d.courseId||!!(learner?pair(learner.id,d.courseId):current.has(d.courseId));
 });
 for(const collection of ['learning_activity','quiz_attempts','submissions'])if(data[collection])data[collection]=data[collection].filter(r=>!r.learnerId||!!pair(r.learnerId,r.courseId));
 if(data.notifications)data.notifications=data.notifications.filter(n=>!n.courseId||current.has(n.courseId));
 for(const course of courses){
  const reviews=data.reviews.filter(r=>r.courseId===course.id);
  course.enrolledCount=enrollments.filter(e=>e.courseId===course.id).length;course.reviewsCount=reviews.length;
  course.rating=reviews.length?Math.round(reviews.reduce((sum,r)=>sum+Number(r.rating),0)/reviews.length*10)/10:null;
 }
}
