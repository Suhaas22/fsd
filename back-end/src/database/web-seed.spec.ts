import {readFileSync,readdirSync} from 'fs';
import {join} from 'path';
import {prepareWebSeed} from './web-seed';
describe('Connected student demo source',()=>{
 const directory=join(__dirname,'../../data');
 const original=Object.fromEntries(readdirSync(directory).filter(f=>f.endsWith('.json')).map(f=>[f.slice(0,-5),JSON.parse(readFileSync(join(directory,f),'utf8'))]));
 it('keeps a small catalog without enrolling a learner in every course',()=>{
  const data=prepareWebSeed(original);
  expect(data.courses.filter(c=>c.status==='Published')).toHaveLength(3);
  for(const learner of data.learners)expect(data.enrollments.filter(e=>e.learnerId===learner.id).length).toBeLessThanOrEqual(2);
  expect(data.enrollments.filter(e=>e.learnerId==='lrn-1')).toHaveLength(2);
 });
 it('matches every paid enrollment to exactly one payment and excludes obsolete transactions',()=>{
  const data=prepareWebSeed(original);
  for(const learner of data.learners){
   const own=data.enrollments.filter(e=>e.learnerId===learner.id);
   expect(data.transactions.filter(p=>p.learnerId===learner.id)).toHaveLength(own.filter(e=>Number(data.courses.find(c=>c.id===e.courseId).price)>0).length);
  }
  for(const p of data.transactions)expect(data.enrollments.some(e=>e.id===p.enrollmentId&&e.courseId===p.courseId&&e.learnerId===p.learnerId)).toBe(true);
 });
 it('restricts certificates to completed enrollments and reviews/disputes to enrolled courses',()=>{
  const data=prepareWebSeed(original);
  for(const cert of data.certificates)expect(data.enrollments.some(e=>e.learnerId===cert.learnerId&&e.courseId===cert.courseId&&e.status==='Completed'&&e.progress===100)).toBe(true);
  expect(data.certificates).toHaveLength(data.enrollments.filter(e=>e.status==='Completed').length);
  for(const r of data.reviews)expect(data.enrollments.some(e=>e.learnerId===r.learnerId&&e.courseId===r.courseId)).toBe(true);
  for(const d of data.disputes.filter(d=>d.courseId&&data.learners.some(l=>l.id===(d.learnerId||d.raisedById))))expect(data.enrollments.some(e=>e.learnerId===(d.learnerId||d.raisedById)&&e.courseId===d.courseId)).toBe(true);
 });
 it('removes historical requests that incorrectly link instructors across organizations',()=>{
   const prepared=prepareWebSeed(original);
   for(const r of prepared.instructor_requests){const teacher=prepared.instructors.find(i=>i.id===r.instructorId);expect(teacher).toBeTruthy();if(teacher.organizationId)expect(teacher.organizationId).toBe(r.organizationId);expect(r.name).toBe(teacher.name);expect(r.email).toBe(teacher.email);}
 });
 it('clears older read organization demo notices while preserving current workflow notifications',()=>{
   const data=prepareWebSeed(original);
   expect(data.notifications.some(n=>n.organizationId&&n.read&&!n.recipientId&&!n.recipientRole)).toBe(false);
   const snapshot=JSON.parse(JSON.stringify(original));snapshot.notifications.push({id:'new-organization-event',recipientId:'org-1',title:'New curriculum request',createdAt:'2026-10-28T00:00:00Z',read:false});
   expect(prepareWebSeed(snapshot).notifications.some(n=>n.id==='new-organization-event')).toBe(true);
 });
 it('is deterministic and never changes the original source records',()=>{
  const before=JSON.stringify(original);const prepared=prepareWebSeed(original);
  expect(prepareWebSeed(prepared)).toEqual(prepared);expect(JSON.stringify(original)).toBe(before);
 });
});
