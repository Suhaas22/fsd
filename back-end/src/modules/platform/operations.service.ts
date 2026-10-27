import {DisputesService} from '../disputes/disputes.service';
import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {JsonDatabaseService} from '../../database/json-db.service';
import {JsonRepository} from '../../database/json-repository';
import {assignedInstructorIds} from '../../common/courses/assignment';

@Injectable()
export class OperationsService {
  constructor(private readonly db:JsonDatabaseService,private readonly disputes:DisputesService) {}
  private rows(name:string){return this.db.getCollection<any>(name);}
  async support(actor:any){
    if(actor.canonicalRole!=='organization')throw new ForbiddenException('Organization access is required.');
    const [courses,disputes]=await Promise.all([this.rows('courses'),this.rows('disputes')]);
    const own=courses.filter(c=>c.organizationId===actor.profileId&&!['Archived','Deleted','Rejected'].includes(c.status));
    return {categories:['Payout','Other'],courses:own.map(c=>({id:c.id,title:c.title})),items:disputes.filter(d=>d.organizationId===actor.profileId&&(!d.courseId||courses.some(c=>c.id===d.courseId&&c.organizationId===actor.profileId))).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))};
  }
  async createSupport(actor:any,body:any){
    const options=await this.support(actor);
    if(!options.categories.includes(body.category))throw new BadRequestException('Choose Payout or Other.');
    if(body.category==='Other'&&!String(body.otherCategory||'').trim())throw new BadRequestException('Describe the other issue category.');
    if(!String(body.subject||'').trim()||!String(body.description||'').trim())throw new BadRequestException('Enter a subject and description.');
    const course=body.courseId?options.courses.find(c=>c.id===body.courseId):null;
    if(body.courseId&&!course)throw new ForbiddenException('Choose a course from your own organization.');
    const created=await this.disputes.create({subject:body.subject.trim(),description:body.description.trim(),category:body.category,disputeType:body.category,raisedBy:actor.name,raisedById:actor.id,raisedByRole:'Organization',organizationId:actor.profileId,courseId:course?.id,courseTitle:course?.title} as any);
    if(body.category==='Other')return new JsonRepository<any>('disputes',this.db).update(created.id,{otherCategory:String(body.otherCategory).trim()});
    return created;
  }
  async teachingAssignments(actor:any){
    if(actor.canonicalRole!=='organization')throw new ForbiddenException('Organization access is required.');
    const [teachers,courses,requests,enrollments]=await Promise.all(['instructors','courses','instructor_requests','enrollments'].map(n=>this.rows(n)));
    return {items:teachers.filter(i=>i.organizationId===actor.profileId).map(i=>({id:i.id,name:i.name,email:i.email,status:i.status,organizationName:actor.name,bio:i.bio,specialization:i.specialization,totalEnrollments:enrollments.filter(e=>courses.some(c=>c.id===e.courseId&&c.organizationId===actor.profileId&&assignedInstructorIds(c).includes(i.id)&&!['Archived','Rejected','Deleted'].includes(c.status))).length,courses:courses.filter(c=>c.organizationId===actor.profileId&&!['Archived','Rejected','Deleted'].includes(c.status)&&assignedInstructorIds(c).includes(i.id)).map(c=>({id:c.id,title:c.title,status:c.status,enrollments:enrollments.filter(e=>e.courseId===c.id).length}))})),invitations:requests.filter(r=>r.organizationId===actor.profileId&&!r.courseId&&['org-invitation','invitation'].includes(r.type)&&teachers.some(i=>i.id===r.instructorId&&(!i.organizationId||i.organizationId===actor.profileId))).map(r=>({id:r.id,name:r.instructorName||r.name,email:r.instructorEmail||r.email,status:r.status,createdAt:r.createdAt}))};
  }
  async learners(actor:any){
    if(actor.canonicalRole!=='organization')throw new ForbiddenException('Organization access required.');
    const [learners,courses,enrollments]=await Promise.all(['learners','courses','enrollments'].map(n=>this.rows(n)));
    const ownIds=new Set(courses.filter(c=>c.organizationId===actor.profileId).map(c=>c.id));
    return learners.filter(l=>l.organizationId===actor.profileId||enrollments.some(e=>ownIds.has(e.courseId)&&(e.learnerId===l.id||e.learnerId===l.userId))).map(l=>({id:l.id,name:l.name,email:l.email,status:l.status}));
  }
  async instructor(actor:any,id:string){const data=await this.teachingAssignments(actor);const instructor=data.items.find(i=>i.id===id);if(!instructor)throw new NotFoundException('Instructor not found in your organization.');return instructor;}
  async moduleRequest(actor:any,id:string){
    if(!['organization','admin','superadmin'].includes(actor.canonicalRole))throw new ForbiddenException('Administrator or organization access required.');
    const row=(await this.rows('module_requests')).find(r=>r.id===id);
    if(!row||actor.canonicalRole==='organization'&&row.organizationId!==actor.profileId)throw new NotFoundException('Curriculum request not found.');return row;
  }
  async invitationLookup(actor:any,email:string){
    if(actor.canonicalRole!=='organization')throw new ForbiddenException('Organization access is required.');
    if(!email?.trim())throw new BadRequestException('Enter an instructor email.');
    const teacher=(await this.rows('instructors')).find(i=>i.email?.toLowerCase()===email.trim().toLowerCase());
    if(!teacher)throw new NotFoundException('No instructor has this email.');
    if(teacher.status==='Suspended')throw new BadRequestException('This instructor is suspended.');
    if(teacher.organizationId)throw new BadRequestException(teacher.organizationId===actor.profileId?'This instructor already belongs to your organization.':'This instructor belongs to another organization.');
    return {id:teacher.id,name:teacher.name,email:teacher.email};
  }
  async record(req:any,response:any){
    const path=String(req.originalUrl||req.url).split('?')[0].replace(/^\/api\//,'/');
    if(!['POST','PUT','PATCH','DELETE'].includes(req.method)||/notifications|\/activity$|\/auth\/|sync-counts/.test(path))return;
    if(!/^\/(courses|quizzes|assignments|enrollments|learners|users|reviews|certificates|instructors|instructor-requests|student|admin|organization|disputes|payments|workspace\/(?:account|organization\/support))(\/|$)/.test(path))return;
    const data=response?.data||response||{};
    if(data.alreadyEnrolled&&!data.restoredAccess)return;
    const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
    const actorId=req.headers['x-user-id']||token.match(/^jwt-token-(.+)-\d+$/)?.[1];
    const [users,teachers,learners,orgs,courses,requests,disputes,quizzes,assignments,transactions]=await Promise.all(['users','instructors','learners','organizations','courses','module_requests','disputes','quizzes','assignments','transactions'].map(n=>this.rows(n)));
    const account=users.find(u=>u.id===actorId);if(!account)return;
    const actorRole=String(account.role).toLowerCase().replace(/[\s_-]/g,'').replace('student','learner');
    const profile=[...teachers,...learners,...orgs].find(p=>p.userId===actorId||p.email&&p.email.toLowerCase()===account.email?.toLowerCase());
    const routeId=req.params?.id||req.params?.courseId||req.params?.userId||req.params?.requestId;
    const moduleRequest=path.includes('module-request')?requests.find(r=>r.id===(data.id||routeId)):null;
    const dispute=path.includes('dispute')?disputes.find(d=>d.id===(data.id||routeId)):null;
    const assessment=path.startsWith('/quizzes')?quizzes.find(q=>q.id===(routeId||data.id)):path.startsWith('/assignments')?assignments.find(q=>q.id===(routeId||data.id)):null;
    const courseId=moduleRequest?.courseId||assessment?.courseId||data.courseId||req.body?.courseId||courses.find(c=>c.id===(routeId||data.id))?.id;
    const course=courses.find(c=>c.id===courseId);
    const target=teachers.find(i=>i.id===routeId)||learners.find(i=>i.id===routeId)||orgs.find(i=>i.id===routeId||i.userId===routeId);
    const organizationIds=[...new Set([course?.organizationId,data.organizationId,moduleRequest?.organizationId,dispute?.organizationId,target?.organizationId,orgs.some(o=>o.id===target?.id)?target.id:null,actorRole==='organization'?profile?.id:profile?.organizationId,...(req.body?.courseIds||[]).map(id=>courses.find(c=>c.id===id)?.organizationId)].filter(Boolean))];
    let resourceType='account',resourceId=profile?.id||account.id,category=actorRole==='learner'?'learner':actorRole==='instructor'?'instructor':'admin';
    let title=`${account.name} updated account details`;
    if(moduleRequest||/module-request/.test(path)){resourceType='module';resourceId=moduleRequest?.id||data.id;category='instructor';title=path.endsWith('/decision')?`Curriculum ${req.body?.decision==='approve'?'approved':'rejected'}`:'Instructor submitted curriculum changes';}
    else if(path.startsWith('/instructors/')){resourceType='instructor';resourceId=routeId;category='instructor';title=req.body?.status?`Instructor ${req.body.status.toLowerCase()}`:'Instructor details updated';}
    else if(path.startsWith('/instructor-requests')){resourceType='invitation';resourceId=data.id||routeId;category='instructor';title='Instructor invitation updated';}
    else if(path.includes('dispute')||path.endsWith('/organization/support')){resourceType='dispute';resourceId=dispute?.id||data.id||routeId;title='Dispute updated';}
    else if(path.includes('checkout')||path.startsWith('/payments')||path.endsWith('/payouts')){resourceType='payment';resourceId=data.transactionId||data.paymentId||data.id;category='payment';title='Payment recorded';}
    else if(path.startsWith('/quizzes')||path.startsWith('/assignments')){resourceType='course';resourceId=courseId;category='instructor';title=path.startsWith('/quizzes')?'Course quiz updated':'Course assignment updated';}
    else if(path.startsWith('/learners')){resourceType='learner';resourceId=routeId||data.id;category='learner';title='Learner details updated';}
    else if(path.includes('/reviews')){resourceType='learner';resourceId=profile?.id;category='learner';title=req.method==='DELETE'?'Learner removed a review':'Learner review updated';}
    else if(path.includes('enroll')||path.includes('progress')){resourceType='learner';resourceId=profile?.id;category='learner';title=path.includes('progress')?'Learner progress updated':'Learner enrolled in a course';}
    else if(path.startsWith('/courses')||path.startsWith('/admin/courses')){resourceType=data.deleted?'deletedCourse':'course';resourceId=courseId||data.id;title=data.deleted?'Rejected course deleted':path.endsWith('/review')?`Course ${req.body?.decision==='approve'?'approved':'rejected'}`:path.endsWith('/approve')?'Course approved':path.endsWith('/reject')?'Course rejected':path.includes('upload')?'Lesson file uploaded':path.includes('curriculum-draft')?'Instructor saved curriculum draft':path.endsWith('/archive')?'Course archived':path.endsWith('/restore')?'Course restored':path.endsWith('/submit')?'Course submitted for administrator approval':path.endsWith('/assignments')?'Teaching assignments updated':'Course updated';category=/upload|curriculum/.test(path)?'instructor':'admin';}
    else if(path.startsWith('/admin/accounts')){resourceType='user';resourceId=routeId;title=path.endsWith('/verification')?'Organization verification updated':'Account access updated';}
    const payment=resourceType==='payment'?transactions.find(t=>t.id===resourceId):null;
    await this.db.runTransaction(()=>new JsonRepository<any>('operation_logs',this.db).create({actorId,actorName:account.name,actorRole,category,title,details:course?.title||data.title&&`${data.title}${data.reviewNote?' · '+data.reviewNote:''}`||target?.name||'',organizationIds,resourceType,resourceId,courseId,paymentType:payment?.type||data.type,amount:payment?.amount,currency:payment?.currency,reference:payment?.reference,method:payment?.method,status:data.status||req.body?.status||null}));
  }
  async logs(actor:any,query:any={}){
    if(!['organization','admin','superadmin'].includes(actor.canonicalRole))throw new ForbiddenException('Operational logs require organization or administrator access.');
    const [events,requests,payments,enrollments,activity,courses,teachers,learners,users,orgs,disputes,invitations]=await Promise.all(['operation_logs','module_requests','transactions','enrollments','admin_activity','courses','instructors','learners','users','organizations','disputes','instructor_requests'].map(n=>this.rows(n)));
    const all=events.filter(r=>Number.isFinite(Date.parse(r.createdAt))&&users.some(u=>u.id===r.actorId));
    const add=(collection:string,rows:any[],make:(r:any)=>any)=>{for(const r of rows){if(!r.createdAt&&!r.resolvedAt)continue;if(events.some(e=>e.resourceId===r.id&&((collection==='module_requests'&&e.title==='Instructor submitted curriculum changes')||(collection==='transactions'&&e.resourceType==='payment')||(collection==='enrollments'&&e.title==='Learner enrolled in a course'))))continue;all.push({id:`${collection}:${r.id}`,createdAt:r.createdAt||r.resolvedAt,...make(r)});}};
    const orgIds=(r:any)=>{const dispute=disputes.find(d=>d.id===r.disputeId);return [...new Set([r.organizationId,dispute?.organizationId,courses.find(c=>c.id===(r.courseId||dispute?.courseId))?.organizationId].filter(Boolean))];};
    add('module_requests',requests.filter(r=>courses.some(c=>c.id===r.courseId&&c.organizationId===r.organizationId)&&teachers.some(i=>i.id===r.instructorId&&i.organizationId===r.organizationId)),r=>({title:'Instructor submitted curriculum changes',details:r.courseTitle,category:'instructor',actorId:r.instructorId,actorRole:'instructor',actorName:r.instructorName,organizationIds:orgIds(r),resourceType:'module',resourceId:r.id,courseId:r.courseId,status:r.status}));
    add('instructor_requests',invitations.filter(r=>teachers.some(i=>i.id===r.instructorId&&(!i.organizationId||i.organizationId===r.organizationId))),r=>({title:`Instructor invitation · ${r.status}`,details:r.instructorName||r.email||'',category:'instructor',actorRole:'organization',actorId:orgs.find(o=>o.id===r.organizationId)?.userId,organizationIds:orgIds(r),resourceType:'invitation',resourceId:r.id,status:r.status}));
    add('transactions',payments,r=>({title:`${r.type||'Payment'} · ${r.status}`,details:`${r.currency||'INR'} ${Number(r.amount||0).toFixed(2)} · ${r.reference||r.id}`,category:'payment',actorRole:r.type==='Payout'?'admin':'learner',actorId:r.recordedBy||r.payerId||r.learnerId,organizationIds:orgIds(r),resourceType:'payment',resourceId:r.id,paymentType:r.type,amount:Number(r.amount||0),currency:r.currency,reference:r.reference,method:r.method,courseId:r.courseId,status:r.status}));
    add('enrollments',enrollments,r=>({title:'Learner enrolled in a course',details:courses.find(c=>c.id===r.courseId)?.title,category:'learner',actorRole:'learner',actorId:r.learnerId,organizationIds:orgIds(r),resourceType:'learner',resourceId:r.learnerId,courseId:r.courseId,status:r.status}));
    add('admin_activity',activity,r=>({title:r.title||'Administrator action',details:r.actionTaken||'',category:'admin',actorRole:'admin',actorId:r.adminId,actorName:r.adminName,organizationIds:orgIds(r),resourceType:r.disputeId?'dispute':r.courseId?(courses.some(c=>c.id===r.courseId&&c.status!=='Deleted')?'course':'deletedCourse'):'user',resourceId:r.disputeId||r.courseId||r.targetId,courseId:r.courseId,status:r.status}));
    const scoped=all.filter(r=>actor.canonicalRole!=='organization'||r.organizationIds?.includes(actor.profileId)).map(r=>{
      const profile=[...teachers,...learners,...users].find(p=>p.id===r.actorId||p.userId===r.actorId);
      const course=courses.find(c=>c.id===r.courseId);const org=orgs.find(o=>o.id===(course?.organizationId||r.organizationIds?.[0]));
      const prefix=actor.canonicalRole==='organization'?'/org':actor.canonicalRole==='superadmin'?'/super-admin':'/admin';
      let href=`${prefix}/logs/${encodeURIComponent(r.id)}`;
      if(actor.canonicalRole==='organization'){
        if(r.resourceType==='module'&&courses.some(c=>c.id===r.courseId&&c.status!=='Deleted'))href=`/org/courses/${r.courseId}?requestId=${encodeURIComponent(r.resourceId)}#request-${r.resourceId}`;
        else if(r.resourceType==='course'&&courses.some(c=>c.id===r.resourceId&&c.status!=='Deleted'))href=`/org/courses/${r.resourceId}`;
        else if(r.resourceType==='instructor'&&r.resourceId)href=`/org/instructors/${r.resourceId}`;
        else if(r.resourceType==='learner'&&r.resourceId)href=`/org/learners/${r.resourceId}`;
        else if(r.resourceType==='invitation')href='/org/instructor-requests';
        else if(r.resourceType==='payment'&&r.courseId)href=`/org/courses/${r.courseId}#course-payments`;
        else if(r.resourceType==='dispute')href=`/org/disputes?disputeId=${encodeURIComponent(r.resourceId)}`;
      }else{
        if(r.resourceType==='payment')href=`${prefix}/payments?search=${encodeURIComponent(r.resourceId||'')}&type=${r.paymentType==='Payout'?'Payout':'Payment'}`;
        else if(r.resourceType==='dispute')href=actor.canonicalRole==='admin'?`/admin/disputes?disputeId=${encodeURIComponent(r.resourceId)}`:`/super-admin/disputes?disputeId=${encodeURIComponent(r.resourceId)}`;
        else if((r.resourceType==='course'||r.resourceType==='module')&&courses.some(c=>c.id===(r.courseId||r.resourceId)&&c.status!=='Deleted'))href=`${prefix}/courses/${r.courseId||r.resourceId}${r.resourceType==='module'?`?requestId=${encodeURIComponent(r.resourceId)}#request-${r.resourceId}`:''}`;
        else if(r.resourceType==='learner'){const learner=learners.find(l=>l.id===r.resourceId||l.userId===r.resourceId);if(learner?.userId)href=actor.canonicalRole==='admin'?`/admin/users/${learner.userId}`:`/super-admin/learners/${learner.userId}`;}
        else if(r.resourceType==='user'&&users.some(u=>u.id===r.resourceId)){const target=users.find(u=>u.id===r.resourceId);const segment=['Student','Learner'].includes(target.role)?'learners':target.role==='Organization'?'organizations':'admins';href=actor.canonicalRole==='admin'?`/admin/users/${r.resourceId}`:`/super-admin/${segment}/${r.resourceId}`;}
        else if(r.resourceType!=='deletedCourse'&&org?.userId)href=actor.canonicalRole==='admin'?`/admin/users/${org.userId}`:`/super-admin/organizations/${org.userId}`;
      }
      return {...r,sourceActorId:r.actorId,actorId:profile?.userId||r.actorId,actorName:r.actorName||profile?.name||'System',href};
    }).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    const actors=Array.from(new Map(scoped.filter(r=>r.actorId).map(r=>[r.actorId,{id:r.actorId,name:r.actorName,role:r.actorRole}])).values());
    const search=String(query.search||'').toLowerCase();const filtered=scoped.filter(r=>(!query.id||r.id===query.id)&&(!query.category||r.category===query.category)&&(!query.actorId||r.actorId===query.actorId||r.sourceActorId===query.actorId)&&(!search||[r.title,r.details,r.actorName].some(v=>String(v||'').toLowerCase().includes(search))));
    const page=Math.max(1,Math.floor(Number(query.page))||1),limit=20;
    return {items:filtered.slice((page-1)*limit,page*limit),total:filtered.length,page,totalPages:Math.max(1,Math.ceil(filtered.length/limit)),actors};
  }
}
