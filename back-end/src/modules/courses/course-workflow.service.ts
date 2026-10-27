import {courseDuration} from '../../common/learning/duration';
import {assignedInstructorIds,isAssignedInstructor} from '../../common/courses/assignment';
import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JsonDatabaseService } from '../../database/json-db.service';
import { JsonRepository } from '../../database/json-repository';
@Injectable()
export class CourseWorkflowService {
 constructor(private readonly db:JsonDatabaseService){}
 private repo(name:string){return new JsonRepository<any>(name,this.db);}
 async course(id:string){const c=await this.repo('courses').findById(id);if(!c)throw new NotFoundException('Course not found.');return c;}
 assertOrganization(actor:any,c:any){if(actor.canonicalRole!=='organization'||!actor.profileId||c.organizationId!==actor.profileId)throw new ForbiddenException('Only the owning organization can perform this action.');}
 async notify(data:any){return this.repo('notifications').create({...data,read:false,createdAt:new Date().toISOString()});}
 assertInstructor(actor:any,c:any){if(!isAssignedInstructor(c,actor))throw new ForbiddenException('This course is not assigned to your instructor account. Open an assigned course from My courses.');}
 validateModules(modules:any){if(!Array.isArray(modules)||modules.some(m=>!m||typeof m!=='object'||!String(m.title||'').trim()))throw new BadRequestException('Each module needs a title.');}
 async organizationCourses(actor:any,query:any={}){if(actor.canonicalRole!=='organization')throw new ForbiddenException('Organization access is required.');const [courses,teachers,enrollments]=await Promise.all(['courses','instructors','enrollments'].map(n=>this.repo(n).find()));const own=courses.filter(c=>c.organizationId===actor.profileId);const term=String(query.search||'').trim().toLowerCase();const items=own.filter(c=>query.archived==='true'?c.status==='Archived':c.status!=='Archived').map(c=>({...c,...courseDuration(c),instructors:teachers.filter(t=>assignedInstructorIds(c).includes(t.id)).map(t=>({id:t.id,name:t.name,email:t.email})),enrolledCount:enrollments.filter(e=>e.courseId===c.id).length})).filter(c=>!term||[c.title,...c.instructors.map(i=>i.name)].some(v=>String(v||'').toLowerCase().includes(term)));return {items,counts:{active:own.filter(c=>c.status!=='Archived').length,published:own.filter(c=>c.status==='Published').length,archived:own.filter(c=>c.status==='Archived').length}};}
 async archive(id:string,actor:any){return this.db.runTransaction(async()=>{const course=await this.course(id);this.assertOrganization(actor,course);if(course.status==='Archived')return course;const updated=await this.repo('courses').update(id,{status:'Archived',previousStatus:course.status,archivedAt:new Date().toISOString(),archivedBy:actor.id});for(const request of (await this.repo('module_requests').find()).filter(r=>r.courseId===id&&r.status==='Pending'))await this.repo('module_requests').update(request.id,{status:'Cancelled',note:'Course archived by organization.'});return updated;});}
 async restore(id:string,actor:any){const course=await this.course(id);this.assertOrganization(actor,course);if(course.status!=='Archived')throw new ConflictException('Only archived courses can be restored.');return this.repo('courses').update(id,{status:'Draft',archivedAt:null,archivedBy:null});}
 async assignmentOptions(actor:any){
  if(actor.canonicalRole!=='organization'||!actor.profileId)throw new ForbiddenException('Organization access is required.');
  const [courses,instructors]=await Promise.all([this.repo('courses').find(),this.repo('instructors').find()]);
  return {courses:courses.filter(c=>c.organizationId===actor.profileId&&c.status!=='Archived').map(c=>({id:c.id,title:c.title,status:c.status,instructorIds:assignedInstructorIds(c)})),instructors:instructors.filter(i=>i.organizationId===actor.profileId&&i.status==='Active').map(i=>({id:i.id,name:i.name,email:i.email,specialization:i.specialization||null}))};
 }
 async assign(body:any,actor:any){return this.db.runTransaction(async()=>{
  if(!Array.isArray(body.courseIds)||!body.courseIds.length||!Array.isArray(body.instructorIds)||!body.instructorIds.length)throw new BadRequestException('Choose at least one course and instructor.');
  const courseIds=[...new Set<string>(body.courseIds)],instructorIds=[...new Set<string>(body.instructorIds)];const options=await this.assignmentOptions(actor);
  if(courseIds.some(id=>!options.courses.some(c=>c.id===id)))throw new ForbiddenException('You can assign only your organization’s active courses.');
  if(instructorIds.some(id=>!options.instructors.some(i=>i.id===id)))throw new ForbiddenException('Choose active instructors in your organization.');
  const teachers=await this.repo('instructors').find();const updated=[];
  for(const id of courseIds){const course=await this.course(id);const ids=[...new Set([...assignedInstructorIds(course),...instructorIds])];const lead=course.instructorId||instructorIds[0];const team=ids.map(id=>teachers.find(i=>i.id===id)).filter(Boolean).map(i=>({id:i.id,name:i.name,email:i.email,role:i.id===lead?'Lead Instructor':'Co-Instructor'}));
   updated.push(await this.repo('courses').update(id,{instructorId:lead,instructors:team,coInstructorIds:team.map(i=>i.id).filter(id=>id!==lead),instructorName:team.map(i=>i.name).join(', '),leadInstructorName:team.find(i=>i.id===lead)?.name,assignedBy:actor.id,assignedAt:new Date().toISOString()}));
   for(const teacherId of instructorIds.filter(id=>!assignedInstructorIds(course).includes(id)))await this.notify({title:'Course assigned',desc:`${actor.name} assigned you to ${course.title}. You can now prepare its content.`,category:'CourseAssignment',recipientId:teacherId,courseId:id,actionUrl:`/instructor/courses/${id}/content`,actionLabel:'Open course'});
  }
  return {courses:updated,assignedCount:updated.length};
 });}
 async notifyAssignments(course:any,previous:any,actor:any){const before=new Set(previous?assignedInstructorIds(previous):[]);for(const instructorId of assignedInstructorIds(course).filter(id=>!before.has(id)))await this.notify({title:'Course assigned',desc:`${actor.name} assigned you to ${course.title}.`,category:'CourseAssignment',recipientId:instructorId,courseId:course.id,actionUrl:`/instructor/courses/${course.id}/content`,actionLabel:'Open course'});}
 async organizationCourse(id:string,actor:any){const course=await this.course(id);this.assertOrganization(actor,course);const [teachers,enrollments,transactions]=await Promise.all(['instructors','enrollments','transactions'].map(n=>this.repo(n).find()));const ids=assignedInstructorIds(course);const paid=transactions.filter(t=>t.courseId===id&&t.type==='Payment'&&['completed','paid','success','successful'].includes(String(t.status).toLowerCase()));return {...course,...courseDuration(course),instructors:teachers.filter(i=>ids.includes(i.id)).map(i=>({id:i.id,name:i.name,email:i.email})),enrolledCount:enrollments.filter(e=>e.courseId===id).length,modulesCount:Array.isArray(course.modules)?course.modules.length:0,lessonsCount:(course.modules||[]).reduce((sum,m)=>sum+(Array.isArray(m.items)?m.items.length:Array.isArray(m.lessons)?m.lessons.length:0),0),recordedRevenue:paid.reduce((sum,t)=>sum+Number(t.amount||0),0)};}
 async editor(id:string,actor:any){const course=await this.course(id);this.assertInstructor(actor,course);const drafts=await this.repo('curriculum_drafts').find();const draft=drafts.find(d=>d.courseId===id&&d.instructorId===actor.profileId);const pending=(await this.list(actor)).find(r=>r.courseId===id&&r.status==='Pending');const result={...course,modules:draft?.status==='Draft'?draft.modules:pending?.modules||course.modules||[],draftStatus:draft?.status||null,pendingModuleRequest:pending||null};return {...result,...courseDuration(result)};}
 async saveDraft(id:string,body:any,actor:any){return this.db.runTransaction(async()=>{
  const course=await this.course(id);this.assertInstructor(actor,course);if(course.status==='Archived')throw new BadRequestException('Archived courses cannot receive changes.');this.validateModules(body.modules);
  const repo=this.repo('curriculum_drafts');const existing=(await repo.find()).find(d=>d.courseId===id&&d.instructorId===actor.profileId);const changes={courseId:id,instructorId:actor.profileId,modules:body.modules,status:'Draft',savedAt:new Date().toISOString()};const draft=existing?await repo.update(existing.id,changes):await repo.create(changes);return {...course,modules:draft.modules,draftStatus:'Draft',curriculumDraft:draft};
 });}
 async submit(id:string,actor:any){return this.db.runTransaction(async()=>{
  const c=await this.course(id);this.assertOrganization(actor,c);
  if(!['Draft','Rejected','Archived'].includes(c.status))throw new ConflictException('Only draft, rejected or archived courses can be submitted.');
  if(!c.instructorId&&!c.instructors?.length)throw new BadRequestException('Assign an instructor before submitting the course.');
  const updated=await this.repo('courses').update(id,{status:'Pending Approval',submittedAt:new Date().toISOString(),submittedBy:actor.id});
  await this.notify({title:'Course awaiting review',desc:`${actor.name} submitted ${c.title} for platform approval.`,category:'CourseApproval',recipientRole:'platform',courseId:id,organizationId:c.organizationId,actionUrl:'/admin/courses',actionLabel:'Review course'});return updated;
 });}
 async list(actor:any,courseId?:string){
  const rows=await this.repo('module_requests').find();
  return rows.filter(r=>(!courseId||r.courseId===courseId)).filter(r=>actor.canonicalRole==='organization'?r.organizationId===actor.profileId:actor.canonicalRole==='instructor'?actor.aliases.includes(r.instructorId):false).sort((a,b)=>(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0));
 }
 async request(id:string,body:any,actor:any){return this.db.runTransaction(async()=>{
  const c=await this.course(id);this.assertInstructor(actor,c);
  if(!c.organizationId)throw new BadRequestException('This course needs an owning organization.');
  if(c.status==='Archived')throw new BadRequestException('Archived courses cannot receive curriculum changes.');
  this.validateModules(body.modules);
  const quizIds=body.modules.flatMap(m=>(Array.isArray(m.items)?m.items:Array.isArray(m.lessons)?m.lessons:[])).map(l=>l.quizId).filter(Boolean);
  const quizzes=await this.repo('quizzes').find();if(quizIds.some(quizId=>!quizzes.some(q=>q.id===quizId&&q.courseId===id)))throw new BadRequestException('Every assessment must belong to this course.');
  const pending=(await this.repo('module_requests').find()).find(r=>r.courseId===id&&r.status==='Pending');
  if(pending)throw new ConflictException('This course already has curriculum changes awaiting organization review.');
  const request=await this.repo('module_requests').create({courseId:id,courseTitle:c.title,organizationId:c.organizationId,instructorId:actor.profileId||actor.id,instructorName:actor.name,modules:body.modules,baseModules:JSON.stringify(c.modules||[]),status:'Pending',createdAt:new Date().toISOString()});
  await this.notify({title:'Curriculum review requested',desc:`${actor.name} submitted module changes for ${c.title}.`,category:'ModuleApproval',recipientId:c.organizationId,courseId:id,requestId:request.id,actionUrl:`/org/courses/${id}`,actionLabel:'Review content changes'});const draft=(await this.repo('curriculum_drafts').find()).find(d=>d.courseId===id&&d.instructorId===actor.profileId);if(draft)await this.repo('curriculum_drafts').update(draft.id,{status:'Submitted',requestId:request.id});return request;
 });}
 async decide(id:string,body:any,actor:any){return this.db.runTransaction(async()=>{
  const r=await this.repo('module_requests').findById(id);if(!r)throw new NotFoundException('Curriculum request not found.');
  const c=await this.course(r.courseId);this.assertOrganization(actor,c);
  if(r.status!=='Pending')throw new ConflictException('This request has already been reviewed.');
  if(!['approve','reject'].includes(body.decision))throw new BadRequestException('Choose approve or reject.');
  if(body.decision==='reject'&&!String(body.note||'').trim())throw new BadRequestException('Explain why these changes were rejected.');
  if(body.decision==='approve'){
   const teacher=await this.repo('instructors').findById(r.instructorId);
   if(c.status==='Archived'||!teacher||teacher.status!=='Active'||teacher.organizationId!==c.organizationId||!assignedInstructorIds(c).includes(teacher.id))throw new ConflictException('The submitting instructor must still be active and assigned within this organization.');
   if(JSON.stringify(c.modules||[])!==r.baseModules)throw new ConflictException('The curriculum changed since this request. Ask the instructor to submit an updated proposal.');
   const lessons=r.modules.reduce((sum,m)=>sum+(Array.isArray(m.items)?m.items.length:Array.isArray(m.lessons)?m.lessons.length:Number(m.lessons)||0),0);
   const quizIds=r.modules.flatMap(m=>(Array.isArray(m.items)?m.items:Array.isArray(m.lessons)?m.lessons:[])).map(l=>l.quizId).filter(Boolean);
   for(const quiz of (await this.repo('quizzes').find()).filter(q=>q.courseId===c.id&&quizIds.includes(q.id)&&q.status==='Draft'))await this.repo('quizzes').update(quiz.id,{status:'Published',approvedBy:actor.id,approvedAt:new Date().toISOString()});
   await this.repo('courses').update(c.id,{modules:r.modules,modulesCount:r.modules.length,lessonsCount:lessons,curriculumApprovedBy:actor.id,curriculumApprovedAt:new Date().toISOString()});
  }
  const status=body.decision==='approve'?'Approved':'Rejected';
  const drafts=await this.repo('curriculum_drafts').find();for(const draft of drafts.filter(d=>d.requestId===id&&d.status==='Submitted'))await this.repo('curriculum_drafts').update(draft.id,{status});
  const updated=await this.repo('module_requests').update(id,{status,note:String(body.note||'').trim(),reviewedBy:actor.id,reviewedAt:new Date().toISOString()});
  await this.notify({title:`Curriculum changes ${status.toLowerCase()}`,desc:`${actor.name} ${status.toLowerCase()} the module changes for ${c.title}.${updated.note?' '+updated.note:''}`,category:'ModuleApproval',recipientId:r.instructorId,courseId:c.id,actionUrl:`/instructor/courses/${c.id}/content`,actionLabel:'View curriculum'});return updated;
 });}
}
