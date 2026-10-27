import {courseDuration} from '../../common/learning/duration';
import {paymentRecords,completedPaymentStatus} from '../../common/payments/payment-records';
import {isAssignedInstructor} from '../../common/courses/assignment';
import { publishedLessons,enrollmentLearning } from '../../common/learning/learning-records';
import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JsonDatabaseService } from '../../database/json-db.service';
import { JsonRepository } from '../../database/json-repository';
const roleOf = (value:any) => { const role=String(value||'').toLowerCase().replace(/[\s_-]/g,''); return role==='learner'?'student':role==='org'?'organization':role; };
@Injectable()
export class WorkspaceService {
  constructor(private readonly db:JsonDatabaseService) {}
  async identity(headers:any) {
    const token=String(headers.authorization||'').replace(/^Bearer\s+/i,'');
    const id=headers['x-user-id']||token.match(/^jwt-token-(.+)-\d+$/)?.[1];
    const account=(await this.db.getCollection<any>('users')).find(u=>u.id===id);
    if(!account)throw new UnauthorizedException('Please sign in again.');
    if(account.role==='Organization'&&account.status!=='Active')throw new ForbiddenException('Organization access requires administrator verification.');
    if(account.status==='Suspended')throw new ForbiddenException('This account is suspended.');
    const role=roleOf(account.role);const collection=role==='student'?'learners':role==='instructor'?'instructors':role==='organization'?'organizations':null;
    const profiles=collection?await this.db.getCollection<any>(collection):[];
    const profile=profiles.find(p=>p.userId===id||p.id===account.organizationId||String(p.email||'').toLowerCase()===String(account.email).toLowerCase());
    if(profile?.status==='Suspended')throw new ForbiddenException('This instructor profile is suspended.');
    return {id:account.id,name:profile?.name||account.name,email:account.email,role:account.role,canonicalRole:role,profileId:profile?.id||null,organizationId:profile?.organizationId||(role==='organization'?profile?.id:null)||null,aliases:[id,profile?.id,...(account.legacyUserIds||[]),...(profile?.legacyIds||[])].filter(Boolean)};
  }
  async accountProfile(user:any){
    const collection=({student:'learners',instructor:'instructors',organization:'organizations'} as any)[user.canonicalRole];
    const profile=collection?(await this.db.getCollection<any>(collection)).find(p=>p.id===user.profileId):null;
    const {password,...account}=(await this.db.getCollection<any>('users')).find(a=>a.id===user.id)||{};
    return {id:user.id,profileId:user.profileId,role:user.role,name:profile?.name||account.name,email:account.email,phone:profile?.phone||account.phone||'',bio:profile?.bio||account.bio||'',website:profile?.website||'',specialization:profile?.specialization||'',organizationName:profile?.organizationName||null,createdAt:account.createdAt||profile?.createdAt||null};
  }
  async updateAccountProfile(user:any,body:any){
    const name=String(body.name||'').trim();if(name.length<2||name.length>160)throw new BadRequestException('Enter a name between 2 and 160 characters.');
    const fields={name,phone:String(body.phone||'').trim().slice(0,30),bio:String(body.bio||'').trim().slice(0,1000)};
    return this.db.runTransaction(async()=>{
      await new JsonRepository<any>('users',this.db).update(user.id,fields);
      const collection=({student:'learners',instructor:'instructors',organization:'organizations'} as any)[user.canonicalRole];
      if(collection&&user.profileId)await new JsonRepository<any>(collection,this.db).update(user.profileId,fields);
      return this.accountProfile(user);
    });
  }
  private visible(n:any,user:any) {
    if(n.recipientId)return user.aliases.includes(n.recipientId);
    if(!n.recipientRole){const target=n.learnerId||n.organizationId||n.instructorId;if(target)return user.aliases.includes(target);}
    const role=roleOf(n.recipientRole);
    return role==='all'||role==='platform'&&['admin','superadmin'].includes(user.canonicalRole)||role===user.canonicalRole||(!role&&['admin','superadmin'].includes(user.canonicalRole));
  }
  private read(n:any,user:any){return !!n.read || (Array.isArray(n.readBy)&&n.readBy.includes(user.id));}
  async inbox(user:any) {
    const all=await this.db.getCollection<any>('notifications');
    const items=all.filter(n=>this.visible(n,user)&&!(Array.isArray(n.dismissedBy)&&n.dismissedBy.includes(user.id))).sort((a,b)=>(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0)).map(n=>({...n,read:this.read(n,user),...(user.canonicalRole==='superadmin'&&n.category==='CourseApproval'?{actionUrl:'/super-admin/dashboard',actionLabel:'View course queue'}:{})}));
    return {items,unreadCount:items.filter(n=>!n.read).length};
  }
  async mark(user:any,id?:string) {
    return this.db.runTransaction(async()=>{
      const rows=await this.db.getCollection<any>('notifications');const selected=rows.filter(n=>this.visible(n,user)&&(!id||n.id===id));
      if(id&&!selected.length)throw new NotFoundException('Notification not found.');
      for(const n of selected)n.readBy=[...new Set([...(Array.isArray(n.readBy)?n.readBy:[]),user.id])];
      await this.db.setCollection('notifications',rows);return this.inbox(user);
    });
  }
  async dismiss(user:any,id:string) {
    const repo=new JsonRepository<any>('notifications',this.db);const n=await repo.findById(id);
    if(!n||!this.visible(n,user))throw new NotFoundException('Notification not found.');
    await repo.update(id,{dismissedBy:[...new Set([...(n.dismissedBy||[]),user.id])]});return this.inbox(user);
  }
  async broadcast(user:any,body:any) {
    if(!['admin','superadmin'].includes(user.canonicalRole))throw new ForbiddenException('Only administrators can create announcements.');
    if(!String(body.title||'').trim()||!String(body.desc||'').trim())throw new BadRequestException('Title and message are required.');
    if(!['all','student','instructor','organization','admin','superadmin'].includes(body.recipientRole))throw new BadRequestException('Choose an audience.');
    return new JsonRepository<any>('notifications',this.db).create({title:body.title.trim(),desc:body.desc.trim(),recipientRole:body.recipientRole,category:'Announcement',read:false,createdBy:user.id,createdAt:new Date().toISOString()});
  }
  async overview(user:any){
    const [allCourses,enrollments,certificates,profiles,transactions]=await Promise.all(['courses','enrollments','certificates',user.canonicalRole==='organization'?'instructors':'reviews','transactions'].map(n=>this.db.getCollection<any>(n)));
    const payments=await paymentRecords(this.db);
    const ownEnrollments=enrollments.filter(e=>(user.aliases.includes(e.learnerId)||user.aliases.includes(e.userId))&&['Active','Completed'].includes(e.status)&&allCourses.some(c=>c.id===e.courseId&&c.status==='Published'&&(c.instructorId||c.instructors?.length)&&(!(Number(c.price)>0)||payments.some(p=>p.courseId===c.id&&completedPaymentStatus(p.status)&&(user.aliases.includes(p.learnerId)||user.aliases.includes(p.payerId)||user.aliases.includes(p.userId)||p.payerEmail&&user.email&&p.payerEmail.toLowerCase()===user.email.toLowerCase()))))).map(e=>enrollmentLearning(allCourses.find(c=>c.id===e.courseId),e));
    const orgId=user.profileId;
    const ownCourses=allCourses.filter(c=>c.status!=='Archived').filter(c=>user.canonicalRole==='student'?ownEnrollments.some(e=>e.courseId===c.id):user.canonicalRole==='organization'?c.organizationId===orgId:user.aliases.includes(c.instructorId)||(Array.isArray(c.instructors)&&c.instructors.some(i=>user.aliases.includes(typeof i==='string'?i:i.id)))||(Array.isArray(c.coInstructorIds)&&c.coInstructorIds.some(id=>user.aliases.includes(id))));
    const courseIds=new Set(ownCourses.map(c=>c.id));const relatedEnrollments=user.canonicalRole==='student'?ownEnrollments:enrollments.filter(e=>courseIds.has(e.courseId));
    const stats=user.canonicalRole==='student'?[{label:'Enrolled courses',value:ownEnrollments.length},{label:'Completed courses',value:ownEnrollments.filter(e=>e.status==='Completed'||Number(e.progress)===100).length},{label:'Certificates',value:certificates.filter(c=>user.aliases.includes(c.learnerId)&&ownEnrollments.some(e=>e.courseId===c.courseId&&e.status==='Completed'&&Number(e.progress)===100)).length},{label:'Active courses',value:ownEnrollments.filter(e=>e.status==='Active'&&ownCourses.some(c=>c.id===e.courseId)).length}]:[{label:'Courses',value:ownCourses.length},{label:'Published courses',value:ownCourses.filter(c=>c.status==='Published').length},{label:'Learners',value:new Set(relatedEnrollments.map(e=>e.learnerId)).size},{label:user.canonicalRole==='organization'?'Instructors':'Enrollments',value:user.canonicalRole==='organization'?profiles.filter(i=>i.organizationId===orgId).length:relatedEnrollments.length}];
    const courses=ownCourses.map(c=>({id:c.id,title:c.title,status:c.status,category:c.category||null,enrollments:enrollments.filter(e=>e.courseId===c.id).length,progress:user.canonicalRole==='student'?ownEnrollments.find(e=>e.courseId===c.id)?.progress??null:null,enrollmentStatus:user.canonicalRole==='student'?ownEnrollments.find(e=>e.courseId===c.id)?.status||null:null}));
    return {profile:{name:user.name,email:user.email},stats,courses};
  }

  async organizationLearner(user:any,id:string){
    if(user.canonicalRole!=='organization')throw new ForbiddenException('Organization access is required.');
    const [courses,learners,enrollments,certificates,events]=await Promise.all(['courses','learners','enrollments','certificates','learning_activity'].map(n=>this.db.getCollection<any>(n)));
    const own=courses.filter(c=>c.organizationId===user.profileId);const ids=new Set(own.map(c=>c.id));const learner=learners.find(l=>l.id===id||l.userId===id);const aliases=[learner?.id,learner?.userId].filter(Boolean);const rows=enrollments.filter(e=>ids.has(e.courseId)&&[e.learnerId,e.userId].some(id=>aliases.includes(id))).map(e=>({...enrollmentLearning(own.find(c=>c.id===e.courseId),e),courseTitle:own.find(c=>c.id===e.courseId)?.title,courseStatus:own.find(c=>c.id===e.courseId)?.status}));if(!learner||!rows.length)throw new NotFoundException('This learner is not enrolled in your organization’s courses.');
    const activity=events.filter(e=>ids.has(e.courseId)&&aliases.includes(e.learnerId)).map(e=>({...e,courseTitle:own.find(c=>c.id===e.courseId)?.title})).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    const earned=certificates.filter(c=>aliases.includes(c.learnerId)&&ids.has(c.courseId)).map(c=>({...c,courseTitle:own.find(course=>course.id===c.courseId)?.title}));return {learner:{id:learner.id,name:learner.name,email:learner.email,status:learner.status},enrollments:rows,certificates:earned,activity:activity.slice(0,10),stats:{enrollments:rows.length,completed:rows.filter(e=>e.status==='Completed').length,certificates:earned.length,engagementHours:Math.round(activity.reduce((sum,e)=>sum+Number(e.seconds||0),0)/3600*100)/100}};
  }
  async instructorWorkspace(user:any){
    if(user.canonicalRole!=='instructor')throw new ForbiddenException('Instructor access is required.');
    const [teachers,courses,enrollments,learners,accounts,reviews,events,organizations]=await Promise.all(['instructors','courses','enrollments','learners','users','reviews','learning_activity','organizations'].map(n=>this.db.getCollection<any>(n)));
    const instructor=teachers.find(i=>i.id===user.profileId);if(!instructor)throw new NotFoundException('Instructor profile not found.');
    const assigned=courses.filter(c=>c.status!=='Archived'&&isAssignedInstructor(c,user));
    const ids=new Set(assigned.map(c=>c.id));const related=enrollments.filter(e=>ids.has(e.courseId)).map(e=>enrollmentLearning(assigned.find(c=>c.id===e.courseId),e));
    const rows=related.map(e=>{const learner=learners.find(l=>l.id===e.learnerId||l.userId===e.learnerId||l.id===e.userId||l.userId===e.userId);const account=accounts.find(a=>a.id===learner?.userId||a.id===e.learnerId);return {...e,id:learner?.id||e.learnerId||e.userId,enrollmentId:e.id,name:learner?.name||account?.name||e.learnerName||null,email:learner?.email||account?.email||e.learnerEmail||null,profileAvailable:!!learner,course:assigned.find(c=>c.id===e.courseId)?.title||e.courseTitle, lastActive:e.lastAccessedAt||e.lastAccessed||null};});
    const ownEvents=events.filter(e=>ids.has(e.courseId));
    const engagementData=Array.from({length:7},(_,i)=>{const date=new Date();date.setUTCDate(date.getUTCDate()-6+i);const key=date.toISOString().slice(0,10);return {date:key,week:date.toLocaleDateString('en-IN',{day:'numeric',month:'short',timeZone:'UTC'}),hours:Math.round(ownEvents.filter(e=>String(e.createdAt).startsWith(key)).reduce((sum,e)=>sum+Number(e.seconds||0),0)/3600*100)/100};});
    const decorated=assigned.map(c=>{const ratings=reviews.filter(r=>r.courseId===c.id&&Number(r.rating)>=1&&Number(r.rating)<=5);const own=related.filter(e=>e.courseId===c.id);return {...c,...courseDuration(c),organizationName:organizations.find(o=>o.id===c.organizationId)?.name||null,modulesCount:Array.isArray(c.modules)?c.modules.length:0,lessonsCount:publishedLessons(c).length,enrolledCount:own.length,rating:ratings.length?ratings.reduce((sum,r)=>sum+Number(r.rating),0)/ratings.length:null,completionRate:own.length?Math.round(own.filter(e=>e.status==='Completed').length/own.length*100):0};});
    const active=rows.filter(e=>e.status==='Active');return {instructor,courses:decorated,learners:rows,stats:{courses:assigned.length,publishedCourses:assigned.filter(c=>c.status==='Published').length,learners:new Set(rows.map(e=>e.id)).size,enrollments:rows.length,activeLearners:new Set(active.map(e=>e.id)).size,completedEnrollments:rows.filter(e=>e.status==='Completed').length,averageProgress:rows.length?Math.round(rows.reduce((sum,e)=>sum+Number(e.progress||0),0)/rows.length):0,engagementHours:Math.round(ownEvents.reduce((sum,e)=>sum+Number(e.seconds||0),0)/3600*100)/100},engagementData,engagementRecorded:ownEvents.length>0};
  }
  async instructorReviews(user:any){const data=await this.instructorWorkspace(user);const ids=new Set(data.courses.map(c=>c.id));const [reviews,learners]=await Promise.all(['reviews','learners'].map(n=>this.db.getCollection<any>(n)));return reviews.filter(r=>ids.has(r.courseId)).map(r=>({...r,learnerName:learners.find(l=>l.id===r.learnerId||l.userId===r.learnerId)?.name||r.learnerName||null,courseTitle:data.courses.find(c=>c.id===r.courseId)?.title})).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));}
  async instructorReply(user:any,id:string,body:any,remove=false){const rows=await this.instructorReviews(user);if(!rows.some(r=>r.id===id))throw new NotFoundException('Review not found in your assigned courses.');const response=String(body?.response||'').trim();if(!remove&&!response)throw new BadRequestException('Enter a reply.');return new JsonRepository<any>('reviews',this.db).update(id,{response:remove?null:response,repliedAt:remove?null:new Date().toISOString()});}
  async instructorLearner(user:any,id:string){const data=await this.instructorWorkspace(user);const rows=data.learners.filter(l=>l.id===id||l.enrollmentId===id);if(!rows.length)throw new NotFoundException('This learner is not enrolled in your assigned courses.');return {learner:{id:rows[0].id,name:rows[0].name,email:rows[0].email,profileAvailable:rows[0].profileAvailable},enrollments:rows};}

}
