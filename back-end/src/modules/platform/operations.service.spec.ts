import {Test,TestingModule} from '@nestjs/testing';
import {INestApplication} from '@nestjs/common';
import request = require('supertest');
import {mkdtemp,rm} from 'fs/promises';
import {join} from 'path';
import {tmpdir} from 'os';
import {AppModule} from '../../app.module';
import {JsonDatabaseService} from '../../database/json-db.service';
import {OperationsService} from './operations.service';
import {WorkspaceService} from './workspace.service';
import {CourseWorkflowService} from '../courses/course-workflow.service';
import {AnalyticsService} from '../analytics/analytics.service';
import {AuthService} from '../auth/auth.service';

describe('Organization operations and scoped logs',()=>{
 let app:INestApplication,module:TestingModule,db:JsonDatabaseService,operations:OperationsService,workspace:WorkspaceService,workflow:CourseWorkflowService,directory:string,previous:string|undefined;
 beforeAll(async()=>{previous=process.env.DATA_DIR;directory=await mkdtemp(join(tmpdir(),'acadex-operations-'));process.env.DATA_DIR=directory;module=await Test.createTestingModule({imports:[AppModule]}).compile();app=module.createNestApplication();app.setGlobalPrefix('api');await app.listen(0,'127.0.0.1');db=module.get(JsonDatabaseService);operations=module.get(OperationsService);workspace=module.get(WorkspaceService);workflow=module.get(CourseWorkflowService);});
 beforeEach(async()=>{
 const now='2026-10-28T01:00:00.000Z';
 const rows={
 users:[{id:'owner',name:'IIIT SRICITY',email:'owner@iiits.in',role:'Organization',status:'Active'},{id:'other-owner',email:'other@org.in',role:'Organization',status:'Active'},{id:'teacher',name:'Shameer',email:'shameer@iiits.in',password:'Password123!',role:'Instructor',status:'Active'},{id:'student',name:'Nishanth',email:'nishanth@gmail.com',role:'Student',status:'Active'},{id:'admin',name:'Suhaas',role:'Admin',status:'Active'},{id:'super',name:'Super admin',role:'SuperAdmin',status:'Active'}],
 organizations:[{id:'org',userId:'owner',email:'owner@iiits.in',status:'Active'},{id:'other',userId:'other-owner',email:'other@org.in',status:'Active'}],
 instructors:[{id:'i',userId:'teacher',name:'Shameer',email:'shameer@iiits.in',status:'Active',organizationId:'org'},{id:'s',name:'Shivamani',email:'shivamani@iiits.in',status:'Suspended',organizationId:'org'},{id:'foreign',name:'Raghuveer',status:'Active',organizationId:'other'},{id:'available',name:'Available teacher',email:'available@iiits.in',status:'Pending Affiliation'}],
 learners:[{id:'l',userId:'student',name:'Nishanth',email:'nishanth@gmail.com'},{id:'l2',name:'Puneeth'},{id:'other-learner',name:'Other learner'}],
 courses:[{id:'c',title:'Engineering Drawing',organizationId:'org',instructorId:'i',status:'Published',currency:'INR',price:1000,modules:[]},{id:'pending',title:'Pending course',organizationId:'org',instructorId:'i',status:'Pending Approval',modules:[]},{id:'archived',title:'Archived',organizationId:'org',instructorId:'i',status:'Archived',modules:[]},{id:'foreign-course',title:'Other course',organizationId:'other',instructorId:'foreign',status:'Published',modules:[]}],
 enrollments:[{id:'e',learnerId:'l',courseId:'c',progress:50,status:'Active',createdAt:now},{id:'e2',learnerId:'l2',courseId:'c',progress:100,status:'Completed',createdAt:now},{id:'foreign-e',learnerId:'other-learner',courseId:'foreign-course',status:'Active',createdAt:now}],
 transactions:[{id:'pay',type:'Payment',payerId:'l',courseId:'c',amount:1000,currency:'INR',status:'Completed',createdAt:now},{id:'foreign-payment',type:'Payment',payerId:'other-learner',courseId:'foreign-course',amount:5000,currency:'INR',status:'Completed',createdAt:now}],
 reviews:[{id:'valid',learnerId:'l',courseId:'c',rating:4},{id:'invalid',learnerId:'other-learner',courseId:'c',rating:5}],operation_logs:[],module_requests:[],curriculum_drafts:[],admin_activity:[],instructor_requests:[],notifications:[],quizzes:[]
 };for(const [name,items]of Object.entries(rows))await db.setCollection(name,items);
 });
 afterAll(async()=>{await app.close();if(previous===undefined)delete process.env.DATA_DIR;else process.env.DATA_DIR=previous;await rm(directory,{force:true,recursive:true});});
 async function owner(){return workspace.identity({'x-user-id':'owner'});}
 it('returns only associated instructors, actual assigned courses and pending counts',async()=>{const actor=await owner();const data=await operations.teachingAssignments(actor);expect(data.items.map(i=>i.id)).toEqual(['i','s']);expect(data.items[0].courses.map(c=>c.id)).toEqual(['c','pending']);expect(data.items[0].totalEnrollments).toBe(2);expect((await workflow.organizationCourses(actor)).counts.pending).toBe(1);await expect(operations.instructor(actor,'foreign')).rejects.toThrow();});
 it('calculates the 85% share and returns enrolled learner identities and progress',async()=>{const course=await workflow.organizationCourse('c',await owner());expect(course.recordedRevenue).toBe(1000);expect(course.organizationRevenue).toBe(850);expect(course.learners.map(l=>[l.name,l.progress])).toEqual([['Nishanth',50],['Puneeth',100]]);await expect(workflow.organizationCourse('foreign-course',await owner())).rejects.toThrow();});
 it('derives workload and ratings from real enrollment records',async()=>{const data=await module.get(AnalyticsService).getOverview('org');const instructor=data.instructorWorkload.find(i=>i.id==='i');expect(instructor.assignedCourses).toBe(2);expect(instructor.totalEnrollments).toBe(2);expect(instructor.averageCompletionRate).toBe(50);expect(data.topRatedCourses).toHaveLength(1);expect(data.topRatedCourses[0].rating).toBe(4);await db.setCollection('reviews',[]);expect((await module.get(AnalyticsService).getOverview('org')).topRatedCourses.map(c=>c.id)).toEqual(['c','pending']);});
 it('exposes suspended instructors as disabled choices but rejects their assignment and foreign instructors',async()=>{const actor=await owner();expect((await workflow.assignmentOptions(actor)).instructors.find(i=>i.id==='s').status).toBe('Suspended');await expect(workflow.assign({courseIds:['c'],instructorIds:['s']},actor)).rejects.toThrow();await expect(workflow.assign({courseIds:['c'],instructorIds:['foreign']},actor)).rejects.toThrow();});
 it('suspends and reactivates an instructor through HTTP, blocks login and curriculum actions',async()=>{await request(app.getHttpServer()).patch('/api/instructors/i').set('x-user-id','owner').send({status:'Suspended'}).expect(200);await expect(module.get(AuthService).login({email:'shameer@iiits.in',password:'Password123!'})).rejects.toThrow('suspended');await request(app.getHttpServer()).get('/api/courses/c/editor').set('x-user-id','teacher').expect(403);await request(app.getHttpServer()).patch('/api/instructors/foreign').set('x-user-id','owner').send({status:'Suspended'}).expect(403);await request(app.getHttpServer()).patch('/api/instructors/i').set('x-user-id','owner').send({status:'Active'}).expect(200);await request(app.getHttpServer()).get('/api/courses/c/editor').set('x-user-id','teacher').expect(200);const logs=await operations.logs(await owner(),{category:'instructor'});expect(logs.items.some(r=>r.title==='Instructor suspended')).toBe(true);});
 it('records curriculum operations and generates role-correct links to the exact request',async()=>{const result=await request(app.getHttpServer()).post('/api/courses/c/module-requests').set('x-user-id','teacher').send({modules:[{id:'m',title:'New module',items:[]}]}).expect(201);const id=result.body.id;for(const userId of ['owner','admin','super']){const actor=await workspace.identity({'x-user-id':userId});const logs=await operations.logs(actor,{category:'instructor'});expect(logs.items.some(r=>r.href.includes(`requestId=${id}`))).toBe(true);expect((await operations.moduleRequest(actor,id)).modules[0].title).toBe('New module');}await expect(operations.moduleRequest(await workspace.identity({'x-user-id':'other-owner'}),id)).rejects.toThrow();});
 it('isolates organization payment and learner logs and supports actor filters',async()=>{const actor=await owner();let data=await operations.logs(actor);expect(JSON.stringify(data)).not.toContain('foreign-payment');expect(JSON.stringify(data)).not.toContain('other-learner');data=await operations.logs(actor,{category:'payment',actorId:'l'});expect(data.total).toBe(1);expect(data.items[0].href).toBe('/org/courses/c#course-payments');expect((await operations.logs(await workspace.identity({'x-user-id':'admin'}),{category:'payment'})).total).toBe(2);await expect(operations.logs(await workspace.identity({'x-user-id':'student'}))).rejects.toThrow();});
 it('serves scoped HTTP logs, resolves canonical actor filters, and rejects a foreign log detail',async()=>{const logs=await request(app.getHttpServer()).get('/api/workspace/logs?category=payment&actorId=student').set('x-user-id','owner').expect(200);expect(logs.body.total).toBe(1);const id=logs.body.items[0].id;await request(app.getHttpServer()).get(`/api/workspace/logs/${encodeURIComponent(id)}`).set('x-user-id','owner').expect(200);await request(app.getHttpServer()).get(`/api/workspace/logs/${encodeURIComponent(id)}`).set('x-user-id','other-owner').expect(404);});
 it('uses the checkout transaction id in payment links without duplicating the payment log',async()=>{await operations.record({method:'POST',originalUrl:'/api/student/checkout',headers:{'x-user-id':'student'},params:{},body:{courseId:'c'}},{transactionId:'pay',courseId:'c',amount:1000});const logs=await operations.logs(await workspace.identity({'x-user-id':'admin'}),{category:'payment',actorId:'student'});expect(logs.total).toBe(1);expect(logs.items[0].href).toBe('/admin/payments?search=pay&type=Payment');expect(logs.items[0].amount).toBe(1000);});
 it('allows only Payout and Other organization support, requires Other details and refuses foreign courses',async()=>{
   const actor=await owner();expect((await operations.support(actor)).categories).toEqual(['Payout','Other']);
   const body={category:'Other',subject:'Question',description:'Please investigate'};
   await expect(operations.createSupport(actor,body)).rejects.toThrow('other issue');
   await expect(operations.createSupport(actor,{...body,category:'Payout',courseId:'foreign-course'})).rejects.toThrow('own organization');
   const created=await operations.createSupport(actor,{...body,otherCategory:'Account access'});expect(created.organizationId).toBe('org');expect(created.otherCategory).toBe('Account access');expect(created.desiredResolution).toBeNull();
   expect((await operations.support(await workspace.identity({'x-user-id':'other-owner'}))).items).toHaveLength(0);
 });
 it('deletes a rejected course without enrollments and logs the decision without a broken course link',async()=>{
   const rejected=await request(app.getHttpServer()).post('/api/admin/courses/pending/review').set('x-user-id','admin').send({decision:'reject',reason:'Content needs revision'}).expect(201);
   expect(rejected.body.deleted).toBe(true);expect((await db.getCollection<any>('courses')).some(c=>c.id==='pending')).toBe(false);
   expect((await workflow.organizationCourses(await owner())).items.some(c=>c.id==='pending')).toBe(false);
   const decision=(await db.getCollection<any>('course_decisions')).find(r=>r.courseId==='pending');expect(decision.reason).toBe('Content needs revision');
   const logs=await operations.logs(await owner(),{search:'Rejected course deleted'});expect(logs.items.length).toBeGreaterThan(0);expect(logs.items.every(r=>r.href.includes('/org/logs/'))).toBe(true);
 });
 it('denies content access when affiliation is missing or belongs to a different institution',async()=>{
   const actor=await workspace.identity({'x-user-id':'teacher'});
   await expect(workflow.editor('c',{...actor,organizationId:null})).rejects.toThrow('not assigned');
   await expect(workflow.editor('c',{...actor,organizationId:'other'})).rejects.toThrow('not assigned');
 });
 it('records an admin payment, synchronizes organization receipts, super admin finance, notifications and audit logs',async()=>{
   await db.setCollection('settings',[{id:'policy',platformCommissionRate:0.15}]);
   const result=await request(app.getHttpServer()).post('/api/admin/payouts').set('x-user-id','admin').send({organizationId:'org',currency:'INR',amount:400,method:'Bank transfer',reference:'BANK-400'}).expect(201);
   expect(result.body.amount).toBe(400);expect(result.body.recordedBy).toBe('admin');
   const org=await request(app.getHttpServer()).get('/api/workspace/organization/payments').set('x-user-id','owner').expect(200);
   expect(org.body.summaries.find(s=>s.currency==='INR')).toMatchObject({organizationShare:850,paid:400,due:450});expect(org.body.items[0].reference).toBe('BANK-400');expect(org.body.items[0].recordedByName).toBe('Suhaas');
   const other=await request(app.getHttpServer()).get('/api/workspace/organization/payments').set('x-user-id','other-owner').expect(200);expect(other.body.items).toHaveLength(0);
   const executive=await request(app.getHttpServer()).get('/api/admin/finance').set('x-user-id','super').expect(200);expect(executive.body.organizations.find(g=>g.organizationId==='org').paid).toBe(400);
   expect((await db.getCollection<any>('notifications')).some(n=>n.paymentId===result.body.id&&n.recipientId==='org')).toBe(true);
   const logs=await operations.logs(await owner(),{category:'payment'});expect(logs.items.filter(r=>r.resourceId===result.body.id)).toHaveLength(1);expect(logs.items.some(r=>r.resourceId===result.body.id&&r.href==='/org/dashboard?payments=received#organization-payments')).toBe(true);
   await request(app.getHttpServer()).post('/api/admin/payouts').set('x-user-id','super').send({organizationId:'org',currency:'INR',amount:450,method:'UPI',reference:'UPI-450'}).expect(201);
   expect((await operations.organizationPayments(await owner())).summaries.find(g=>g.currency==='INR').due).toBe(0);
 });
 it('rejects unauthorized payouts, duplicate references, overpayment and invalid precision',async()=>{
   await db.setCollection('settings',[{id:'policy',platformCommissionRate:0.15}]);
   const body={organizationId:'org',currency:'INR',amount:100,method:'Bank transfer',reference:'ref-1'};
   for(const actor of ['owner','teacher','student'])await request(app.getHttpServer()).post('/api/admin/payouts').set('x-user-id',actor).send(body).expect(403);
   await request(app.getHttpServer()).post('/api/admin/payouts').set('x-user-id','admin').send({...body,amount:900}).expect(400);
   await request(app.getHttpServer()).post('/api/admin/payouts').set('x-user-id','admin').send({...body,amount:1.001}).expect(400);
   await request(app.getHttpServer()).post('/api/admin/payouts').set('x-user-id','admin').send(body).expect(201);
   await request(app.getHttpServer()).post('/api/admin/payouts').set('x-user-id','admin').send({...body,reference:'REF-1'}).expect(409);
   const organizations=await db.getCollection<any>('organizations');organizations[0].status='Suspended';await db.setCollection('organizations',organizations);
   await request(app.getHttpServer()).post('/api/admin/payouts').set('x-user-id','admin').send({...body,reference:'ref-2'}).expect(400);
 });
 it('prevents concurrent payments from exceeding the available organization earnings',async()=>{
   await db.setCollection('settings',[{id:'policy',platformCommissionRate:0.15}]);
   const results=await Promise.all(['one','two'].map(reference=>request(app.getHttpServer()).post('/api/admin/payouts').set('x-user-id','admin').send({organizationId:'org',currency:'INR',amount:600,method:'Bank transfer',reference})));
   expect(results.map(r=>r.status).sort()).toEqual([201,400]);
   const receipt=await operations.organizationPayments(await owner());expect(receipt.summaries.find(g=>g.currency==='INR')).toMatchObject({paid:600,due:250});
 });
 it('limits email lookup to available, unsuspended instructors and scopes the learner roster',async()=>{await expect(operations.invitationLookup(await owner(),'shameer@iiits.in')).rejects.toThrow('already belongs');await expect(operations.invitationLookup(await owner(),'shivamani@iiits.in')).rejects.toThrow('suspended');expect((await operations.invitationLookup(await owner(),'AVAILABLE@IIITS.IN')).id).toBe('available');expect((await operations.learners(await owner())).map(l=>l.id)).toEqual(['l','l2']);});
});
