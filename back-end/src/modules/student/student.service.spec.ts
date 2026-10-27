import {ReviewsService} from '../reviews/reviews.service';
import {CertificatesService} from '../certificates/certificates.service';
import {prepareWebSeed} from '../../database/web-seed';
import {ValidationPipe} from '@nestjs/common';
import {UpdateCourseDto} from '../courses/dto/course.dto';
import { Test,TestingModule } from '@nestjs/testing';
import { mkdtemp,rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { AppModule } from '../../app.module';
import { JsonDatabaseService } from '../../database/json-db.service';
import { StudentService } from './student.service';
import { AuthService } from '../auth/auth.service';
import { PlatformService } from '../platform/platform.service';
import { WorkspaceService } from '../platform/workspace.service';
import { CoursesController } from '../courses/courses.controller';
import { QuizzesController } from '../quizzes/quizzes.controller';
import { CourseWorkflowService } from '../courses/course-workflow.service';
describe('Learner records and workflows',()=>{
 let module:TestingModule,db:JsonDatabaseService,service:StudentService,dir:string;let previous:string|undefined;
 beforeAll(async()=>{previous=process.env.DATA_DIR;dir=await mkdtemp(join(tmpdir(),'acadex-learner-'));process.env.DATA_DIR=dir;module=await Test.createTestingModule({imports:[AppModule]}).compile();db=module.get(JsonDatabaseService);await db.onModuleInit();service=module.get(StudentService);});
 beforeEach(async()=>{const rows={
  users:[{id:'u1',role:'Student',name:'Nishanth',email:'nishanth@test.com',password:'Password123!',status:'Active'},{id:'u2',role:'Student',name:'Puneeth',email:'puneeth@test.com',status:'Active'}],
  learners:[{id:'l1',userId:'u1',name:'Nishanth',email:'nishanth@test.com',status:'Active'},{id:'l2',userId:'u2',name:'Puneeth',email:'puneeth@test.com',status:'Active'}],
  organizations:[{id:'org',name:'Institute',status:'Active'}],instructors:[{id:'inst',name:'Teacher',organizationId:'org',status:'Active'}],
  courses:[{id:'c1',title:'Actual course',status:'Published',instructorId:'inst',organizationId:'org',price:100,currency:'INR',enrolledCount:999,rating:5,modules:[{id:'m1',title:'Published module',items:[{id:'lesson1',title:'Recorded video',type:'Video',videoUrl:'/uploads/lesson.mp4'},{id:'lesson2',title:'Recorded reading',type:'Reading',content:'Published text'}]}]},{id:'c2',title:'Another course',status:'Published',organizationId:'org',instructorId:'inst',price:200,currency:'INR',modules:[]},{id:'free',title:'Free course',status:'Published',organizationId:'org',instructorId:'inst',price:0,currency:'INR',modules:[]}],
  enrollments:[{id:'e1',learnerId:'l1',courseId:'c1',status:'Active',progress:65},{id:'e2',learnerId:'l2',courseId:'c2',status:'Active',progress:20}],
  transactions:[{id:'p1',payerId:'l1',courseId:'c1',type:'Payment',amount:100,currency:'INR',status:'Completed',method:'UPI',createdAt:'2026-01-01T00:00:00Z'},{id:'p2',payerId:'l2',courseId:'c2',type:'Payment',amount:200,currency:'INR',status:'Completed'},{id:'failed',payerId:'u1',courseId:'c1',type:'Payment',amount:100,currency:'INR',status:'Failed'}],
  reviews:[{id:'r1',courseId:'c1',learnerId:'l1',rating:4}],curriculum_drafts:[],learning_activity:[],certificates:[],notifications:[],disputes:[],quizzes:[],quiz_questions:[],quiz_attempts:[],module_requests:[],settings:[{id:'s',defaultCurrency:'INR'}]
 };for(const [name,items]of Object.entries(rows))await db.setCollection(name,items);});
 afterAll(async()=>{await module.close();if(previous===undefined)delete process.env.DATA_DIR;else process.env.DATA_DIR=previous;await rm(dir,{recursive:true,force:true});});
 it('joins live catalog counts, ratings, teaching team and institute records',async()=>{const course=await service.getCatalogCourse('c1');expect(course.enrolledCount).toBe(1);expect(course.rating).toBe(4);expect(course.organizationName).toBe('Institute');expect(course.instructorName).toBe('Teacher');expect(course.lessonsCount).toBe(2);expect(JSON.stringify(course.modules)).not.toContain('/uploads/lesson.mp4');});
 it('connects paid learning entries to their own receipt and excludes unpaid course access',async()=>{
  expect((await service.getEnrollments('u1'))[0].paymentId).toBe('p1');
  const payments=await db.getCollection<any>('transactions');await db.setCollection('transactions',payments.filter(p=>p.id!=='p1'));
  expect(await service.getEnrollments('u1')).toEqual([]);
  expect((await service.browse('u1')).items.find(c=>c.id==='c1').isEnrolled).toBe(false);
  const workspace=module.get(WorkspaceService);const user=await workspace.identity({'x-user-id':'u1'});
  expect((await workspace.overview(user)).courses).toEqual([]);
  const paid=await service.checkout('u1',{courseId:'c1',paymentMethod:'upi',upiId:'learner@bank'});
  expect((await service.getEnrollments('u1'))[0].paymentId).toBe(paid.transactionId);
  expect((await service.receipt('u1',paid.transactionId)).enrollmentId).toBe('e1');
  expect((await db.getCollection<any>('enrollments')).filter(e=>e.learnerId==='l1'&&e.courseId==='c1')).toHaveLength(1);
 });
 it('hides missing and cancelled learning entries while retaining their payment history',async()=>{
  const rows=await db.getCollection<any>('enrollments');rows.push({id:'missing',learnerId:'l1',courseId:'missing-course',status:'Active'});await db.setCollection('enrollments',rows);
  expect((await service.getEnrollments('u1')).map(e=>e.id)).toEqual(['e1']);
  rows[0].status='Cancelled';await db.setCollection('enrollments',rows);
  expect(await service.getEnrollments('u1')).toEqual([]);
  expect((await service.billing('u1')).summary.completedPayments).toBe(1);
 });
 it('uses exactly three current seed courses while keeping archived course and financial history',()=>{
  const ids=['cou-50d09a28','cou-fb5ac543','cou-2238c587','cou-old','crs-old'];
  const snapshot={courses:ids.map(id=>({id,status:'Published'})),transactions:[{id:'historical',courseId:'cou-old'}],enrollments:[{id:'history',courseId:'cou-old'}]};
  const prepared=prepareWebSeed(snapshot);
  expect(prepared.courses.filter(c=>c.status==='Published').map(c=>c.id)).toEqual(ids.slice(0,3));
  expect(prepared.transactions).toEqual(snapshot.transactions);expect(prepared.enrollments).toEqual(snapshot.enrollments);
 });
 it('rejects reviews and course disputes outside the learner enrollment',async()=>{
  const reviews=module.get(ReviewsService);
  await expect(reviews.create({courseId:'c1',rating:5,comment:'Not enrolled'},'u2')).rejects.toThrow('Enroll');
  await expect(reviews.create({courseId:'c1',rating:5,comment:'Duplicate'},'u1')).rejects.toThrow('already reviewed');
  await expect(service.createDispute('u2',{courseId:'c1',subject:'Course issue',description:'Not my course'})).rejects.toThrow('not enrolled');
  const accountIssue=await service.createDispute('u2',{subject:'Account issue',description:'Help with my profile',category:'Account'});
  expect(accountIssue.raisedById).toBe('l2');
  const enrollments=await db.getCollection<any>('enrollments');enrollments[0].status='Cancelled';await db.setCollection('enrollments',enrollments);
  expect(await reviews.findMy('u1')).toEqual([]);
 });
 it('issues and displays certificates only for fully completed enrollments',async()=>{
  const certificates=module.get(CertificatesService);
  await expect(certificates.create({learnerId:'l1',courseId:'c1'})).rejects.toThrow('Complete');
  await db.setCollection('certificates',[{id:'invalid',learnerId:'l1',courseId:'c1',credentialId:'invalid-key'}]);
  expect(await service.getCertificates('u1')).toEqual([]);expect((await service.getProfile('u1')).certificatesEarned).toBe(0);
  await expect(certificates.verify('invalid-key')).rejects.toThrow('not found');
  const enrollments=await db.getCollection<any>('enrollments');Object.assign(enrollments[0],{status:'Completed',progress:100,completedLessons:['lesson1','lesson2']});await db.setCollection('enrollments',enrollments);
  expect(await service.getCertificates('u1')).toHaveLength(1);
  const file=await service.downloadCertificate('u1','invalid');expect(file.mimeType).toBe('application/pdf');expect(Buffer.from(file.content,'base64').subarray(0,8).toString()).toBe('%PDF-1.4');
  await expect(service.downloadCertificate('u2','invalid')).rejects.toThrow('not found');
 });
 it('requires both all lessons and a passing published assessment before issuing a certificate',async()=>{
  await db.setCollection('quizzes',[{id:'required',courseId:'c1',title:'Required assessment',status:'Published',passingScore:80}]);
  await db.setCollection('quiz_questions',[{id:'q',quizId:'required',questionText:'Question',optionA:'Wrong',optionB:'Correct',correctOption:'B'}]);
  await service.updateProgress('u1','e1','lesson1',true);await service.updateProgress('u1','e1','lesson2',true);
  expect(await service.getCertificates('u1')).toEqual([]);
  await service.submitAssessment('u1','c1',{quizId:'required',answers:{q:0}});expect(await service.getCertificates('u1')).toEqual([]);
  await service.submitAssessment('u1','c1',{quizId:'required',answers:{q:1}});expect(await service.getCertificates('u1')).toHaveLength(1);
 });
 it('keeps instructor, learner, admin and organization published duration in sync while isolating drafts',async()=>{
  const courses=await db.getCollection<any>('courses');courses[0].modules=[{id:'m',title:'Duration test',items:[{id:'lesson',title:'Video',type:'Video',duration:'00:12'},{id:'read',type:'Reading',title:'Reading',duration:2}]}];await db.setCollection('courses',courses);
  await db.setCollection('users',[...(await db.getCollection<any>('users')),{id:'teacher-user',role:'Instructor',name:'Teacher',email:'teacher@duration.test',status:'Active'}]);
  const teachers=await db.getCollection<any>('instructors');teachers[0].userId='teacher-user';await db.setCollection('instructors',teachers);
  const workspace=module.get(WorkspaceService),workflow=module.get(CourseWorkflowService);const teacher=await workspace.identity({'x-user-id':'teacher-user'});
  expect((await workspace.instructorWorkspace(teacher)).courses.find(c=>c.id==='c1').duration).toBe('2 min 12 sec');
  expect((await service.getCatalogCourse('c1')).duration).toBe('2 min 12 sec');
  expect((await module.get(PlatformService).course('c1')).duration).toBe('2 min 12 sec');
  expect((await workflow.organizationCourse('c1',{canonicalRole:'organization',profileId:'org'})).duration).toBe('2 min 12 sec');
  await workflow.saveDraft('c1',{modules:[{id:'m',title:'Draft',items:[{id:'quiz',title:'Assessment',type:'Quiz',duration:5}]}]},teacher);
  expect((await workflow.editor('c1',teacher)).duration).toBe('5 min');
  expect((await service.getCatalogCourse('c1')).duration).toBe('2 min 12 sec');
 });
 it('preserves recorded history and does not write progress while rendering enrollment or profile data',async()=>{const before=await db.getCollection('enrollments');expect((await service.getEnrollments('u1'))[0].progress).toBe(65);expect((await service.getProfile('u1')).inProgressCourses).toBe(1);expect(await db.getCollection('enrollments')).toEqual(before);});
 it('uses actual completion markers without fabricating numeric-count lessons',async()=>{await db.setCollection('enrollments',[{id:'e1',learnerId:'l1',courseId:'c1',status:'Active',progress:95,completedLessons:['lesson1']}]);expect((await service.getEnrollments('u1'))[0].progress).toBe(50);const courses=await db.getCollection<any>('courses');courses[0].modules=[{id:'numbers',title:'Summary only',lessons:30}];await db.setCollection('courses',courses);expect((await service.content('u1','c1')).lessons).toEqual([]);});
 it('loads only owned content, with recorded media and no substituted sample videos',async()=>{const content=await service.content('u1','c1');expect(content.lessons[0].videoUrl).toBe('/uploads/lesson.mp4');expect(content.lessons[1].videoUrl).toBeNull();expect(content.lessons[1].description).toBe('Published text');await expect(service.content('u2','c1')).rejects.toThrow('not enrolled');});
 it('keeps learner billing and receipts private and excludes failed payments from total paid',async()=>{const bill=await service.billing('u1');expect(bill.summary.totalPaid).toBe(100);expect(bill.summary.transactions).toBe(2);expect(bill.items.map(p=>p.id)).not.toContain('p2');expect((await service.receipt('u1','p1')).organizationName).toBe('Institute');await expect(service.receipt('u2','p1')).rejects.toThrow('not found');});
 it('persists profile edits in both the learner profile and sign-in account',async()=>{await service.updateProfile('u1',{name:'Updated learner',bio:'My real biography'});expect((await service.getProfile('u1')).bio).toBe('My real biography');const signed=await module.get(AuthService).login({email:'nishanth@test.com',password:'Password123!',role:'Student'});expect(signed.user.name).toBe('Updated learner');expect((await db.getCollection<any>('users')).find(u=>u.id==='u2').name).toBe('Puneeth');});
 it('creates and comments on support requests using server account identity',async()=>{const created=await service.createDispute('u1',{subject:'Access issue',description:'Recorded details',courseId:'c1',raisedBy:'Someone else',learnerId:'l2'});expect(created.raisedBy).toBe('Nishanth');expect(created.raisedById).toBe('l1');expect((await service.myDisputes('u2'))).toEqual([]);await expect(service.comment('u2',created.id,{message:'Wrong learner'})).rejects.toThrow('not found');const updated=await service.comment('u1',created.id,{message:'More detail',author:'Admin',isAdmin:true});expect(updated.comments[0]).toMatchObject({author:'Nishanth',isAdmin:false,message:'More detail'});});
 it('does not substitute an assessment from another course or expose answer keys',async()=>{await db.setCollection('quizzes',[{id:'foreign',courseId:'c2',title:'Other quiz',status:'Published',passingScore:80}]);await expect(service.assessment('u1','c1')).rejects.toThrow('No published assessment');await db.setCollection('quizzes',[{id:'quiz',courseId:'c1',title:'Actual quiz',status:'Published',passingScore:80}]);await db.setCollection('quiz_questions',[{id:'question',quizId:'quiz',questionText:'Recorded question',optionA:'A',optionB:'B',correctOption:'B'}]);const data=await service.assessment('u1','c1');expect(data.questions[0].options).toEqual(['A','B']);expect(data.questions[0]).not.toHaveProperty('correctOption');await expect(service.assessment('u2','c1')).rejects.toThrow('not enrolled');});
 it('grades and saves assessments on the server and never issues a course certificate merely for a quiz pass',async()=>{await db.setCollection('quizzes',[{id:'quiz',courseId:'c1',title:'Quiz',status:'Published',passingScore:80,showExplanations:true}]);await db.setCollection('quiz_questions',[{id:'question',quizId:'quiz',questionText:'Question',optionA:'A',optionB:'B',correctOption:'B',explanation:'Recorded explanation'}]);const failed=await service.submitAssessment('u1','c1',{quizId:'quiz',answers:{question:0},score:100});expect(failed.score).toBe(0);const passed=await service.submitAssessment('u1','c1',{quizId:'quiz',answers:{question:1}});expect(passed.score).toBe(100);expect((await db.getCollection<any>('quiz_attempts'))[1].learnerId).toBe('l1');expect(await db.getCollection('certificates')).toEqual([]);});
 it('records one purchase and one enrollment when checkout requests are repeated concurrently',async()=>{const result=await Promise.all([service.checkout('u1',{courseId:'c2',paymentMethod:'upi',upiId:'learner@bank'}),service.checkout('u1',{courseId:'c2',paymentMethod:'upi',upiId:'learner@bank'})]);expect(result[0].transactionId).toBe(result[1].transactionId);expect((await db.getCollection<any>('transactions')).filter(t=>t.payerId==='l1'&&t.courseId==='c2')).toHaveLength(1);expect((await db.getCollection<any>('enrollments')).filter(e=>e.learnerId==='l1'&&e.courseId==='c2')).toHaveLength(1);});
 it('keeps unapproved curriculum out of learner content until organization approval',async()=>{const workflow=module.get(CourseWorkflowService);const request=await workflow.request('c1',{modules:[{id:'approved-module',title:'Requested module',items:[{id:'new-lesson',title:'Proposed lesson',type:'Reading',content:'Approved later'}]}]},{id:'teacher-user',profileId:'inst',organizationId:'org',aliases:['inst'],name:'Teacher',canonicalRole:'instructor'});expect((await service.content('u1','c1')).lessons.map(l=>l.id)).not.toContain('new-lesson');await workflow.decide(request.id,{decision:'approve'},{id:'org-user',profileId:'org',name:'Institute',canonicalRole:'organization'});expect((await service.content('u1','c1')).lessons[0].id).toBe('new-lesson');});
 it('filters catalog records on the backend and returns facets and bounded pages',async()=>{
  const courses=await db.getCollection<any>('courses');Object.assign(courses[0],{category:'Programming',level:'Beginner'});Object.assign(courses[1],{category:'Cloud',level:'Advanced'});await db.setCollection('courses',courses);
  const result=await service.browse('u1',{category:'Programming',enrollment:'enrolled',search:'Teacher',limit:1,page:99});
  expect(result.items.map(c=>c.id)).toEqual(['c1']);expect(result.items[0].isEnrolled).toBe(true);expect(result.page).toBe(1);expect(result.facets.categories).toEqual(['Cloud','Programming']);
  expect((await service.browse('u1',{price:'free'})).items.map(c=>c.id)).toEqual(['free']);
  expect((await service.browse('u1',{category:'missing'})).total).toBe(0);
  expect((await service.browse('u1',{sort:'price-high',limit:1})).items[0].id).toBe('c2');
 });
 it('uses the same payment mapping in billing, receipts and administrator ledgers',async()=>{
  const rows=await db.getCollection<any>('transactions');rows[0].course='Old title';rows[0].method=undefined;rows[0].paymentMethod='UPI recorded';rows[0].reference='bank-reference';await db.setCollection('transactions',rows);
  const bill=await service.billing('u1',{search:'bank-reference',status:'Completed',year:'2026',organizationId:'org'});
  const receipt=await service.receipt('u1','p1');const ledger=await module.get(PlatformService).payments({search:'p1'});
  expect(bill.items[0]).toEqual(receipt);expect(ledger.items[0]).toEqual(receipt);expect(receipt.course).toBe('Actual course');expect(receipt.recordedCourseTitle).toBe('Old title');expect(receipt.amount).toBe(100);expect(receipt.method).toBe('UPI recorded');expect(receipt.enrollmentId).toBe('e1');
  expect(bill.summary.transactions).toBe(2);expect(bill.summary.totalPaid).toBe(100);expect(bill.total).toBe(1);expect(bill.facets.statuses).toContain('Failed');
 });
 it('retains deleted course history in storage while hiding it from current learning',async()=>{
  const courses=(await db.getCollection<any>('courses')).filter(c=>c.id!=='c1');await db.setCollection('courses',courses);
  expect(await service.getEnrollments('u1')).toEqual([]);expect((await db.getCollection<any>('enrollments')).some(e=>e.id==='e1')).toBe(true);
  const payment=await service.receipt('u1','p1');expect(payment.courseAvailable).toBe(false);expect(payment.amount).toBe(100);expect(payment.enrollmentId).toBe('e1');
  await expect(service.content('u1','c1')).rejects.toThrow('not enrolled');
  expect((await service.getProfile('u1')).enrolledCourses).toBe(0);
 });
 it('restores access for an existing successful payment without charging the learner again',async()=>{
  const rows=await db.getCollection<any>('transactions');rows.push({id:'already-paid',payerId:'u1',courseId:'c2',type:'Payment',amount:150,currency:'INR',status:'Completed',method:'UPI'});await db.setCollection('transactions',rows);
  const result=await service.checkout('u1',{courseId:'c2',paymentMethod:'upi',upiId:'learner@bank'});
  expect(result.transactionId).toBe('already-paid');expect(result.amount).toBe(150);expect(result.restoredAccess).toBe(true);
  expect(await db.getCollection('transactions')).toEqual(rows);
  expect((await service.getEnrollments('u1')).some(e=>e.courseId==='c2')).toBe(true);
 });

 it('stores valid support categories and rejects unknown categories',async()=>{expect(service.disputeCategories()).toContain('Course access');const request=await service.createDispute('u1',{subject:'Access',description:'Cannot open lesson',category:'Course access',courseId:'c1'});expect(request.category).toBe('Course access');await expect(service.createDispute('u1',{subject:'Access',description:'Details',category:'Invented'})).rejects.toThrow('valid issue category');});
 it('returns every assigned course by ID and current learner profiles, including historical learner links',async()=>{
  const workspace=module.get(WorkspaceService);const user={id:'teacher',profileId:'inst',organizationId:'org',aliases:['teacher','inst'],canonicalRole:'instructor'};
  const courses=await db.getCollection<any>('courses');for(let i=0;i<12;i++)courses.push({id:'extra-'+i,title:'Assigned '+i,organizationId:'org',instructors:['inst']});courses.push({id:'foreign',title:'Unrelated',instructorId:'someone'});await db.setCollection('courses',courses);
  const enrollments=await db.getCollection<any>('enrollments');enrollments[0].learnerEmail='j.wilson@old.com';enrollments.push({id:'historical',learnerId:'removed',courseId:'c1',learnerName:'Recorded learner',status:'Active',progress:10});await db.setCollection('enrollments',enrollments);
  const data=await workspace.instructorWorkspace(user);expect(data.courses).toHaveLength(15);expect(data.courses.some(c=>c.id==='foreign')).toBe(false);expect(data.learners.find(l=>l.id==='l1').email).toBe('nishanth@test.com');expect((await workspace.instructorLearner(user,'e1')).learner.name).toBe('Nishanth');expect((await workspace.instructorLearner(user,'removed')).learner.profileAvailable).toBe(false);await expect(workspace.instructorLearner(user,'stranger')).rejects.toThrow('not enrolled');await expect(workspace.instructorWorkspace({canonicalRole:'student'})).rejects.toThrow('Instructor access');
 });
 it('records learning time only for enrolled published lessons and aggregates real engagement',async()=>{
  const workspace=module.get(WorkspaceService);const user={id:'teacher',profileId:'inst',organizationId:'org',aliases:['inst'],canonicalRole:'instructor'};expect((await workspace.instructorWorkspace(user)).engagementRecorded).toBe(false);
  await service.recordEngagement('u1','c1',{lessonId:'lesson1',seconds:30});await service.recordEngagement('u1','c1',{lessonId:'lesson2',seconds:30});const data=await workspace.instructorWorkspace(user);expect(data.stats.engagementHours).toBe(0.02);expect(data.engagementRecorded).toBe(true);expect(data.engagementData.reduce((n,d)=>n+d.hours,0)).toBe(0.02);
  await expect(service.recordEngagement('u2','c1',{lessonId:'lesson1',seconds:30})).rejects.toThrow('not enrolled');await expect(service.recordEngagement('u1','c1',{lessonId:'missing',seconds:30})).rejects.toThrow('published');await expect(service.recordEngagement('u1','c1',{lessonId:'lesson1',seconds:3600})).rejects.toThrow('between 1 and 30');
 });
 it('scopes instructor reviews and reply actions to assigned courses',async()=>{
  const workspace=module.get(WorkspaceService);const user={id:'teacher',profileId:'inst',organizationId:'org',aliases:['inst'],canonicalRole:'instructor'};await db.setCollection('reviews',[{id:'r1',courseId:'c1',learnerId:'l1',learnerName:'Old name',rating:4},{id:'foreign',courseId:'other',rating:5}]);const reviews=await workspace.instructorReviews(user);expect(reviews).toHaveLength(1);expect(reviews[0].learnerName).toBe('Nishanth');expect((await workspace.instructorReply(user,'r1',{response:'Thank you'})).response).toBe('Thank you');expect((await workspace.instructorReply(user,'r1',null,true)).response).toBeNull();await expect(workspace.instructorReply(user,'foreign',{response:'Wrong course'})).rejects.toThrow('not found');
 });

 it('keeps unified account profile edits in the account and profile without changing email or history',async()=>{
  const workspace=module.get(WorkspaceService);const user=await workspace.identity({'x-user-id':'u1'});const before=await db.getCollection('enrollments');const profile=await workspace.updateAccountProfile(user,{name:'Nishanth updated',phone:'123',bio:'Learning',email:'someone@invalid.com',role:'Admin'});expect(profile.email).toBe('nishanth@test.com');expect(profile.name).toBe('Nishanth updated');expect(profile).not.toHaveProperty('password');expect((await db.getCollection<any>('learners'))[0].name).toBe('Nishanth updated');expect((await db.getCollection<any>('users'))[0].role).toBe('Student');expect(await db.getCollection('enrollments')).toEqual(before);
 });
 it('shows all pending courses and only the ten most recently approved courses',async()=>{
  const rows=Array.from({length:16},(_,i)=>({id:'approved-'+i,title:'Approved '+i,status:'Published',reviewedAt:new Date(Date.UTC(2026,9,i+1)).toISOString(),instructorId:'inst'}));rows.push({id:'pending',title:'Pending course',status:'Pending Approval',reviewedAt:null,instructorId:'inst'},{id:'draft',title:'Draft course',status:'Draft',reviewedAt:null,instructorId:'inst'});await db.setCollection('courses',rows);const queue=await module.get(PlatformService).courseQueue();expect(queue.pending.map(c=>c.id)).toEqual(['pending']);expect(queue.recentlyApproved).toHaveLength(10);expect(queue.recentlyApproved[0].id).toBe('approved-15');expect(queue.recentlyApproved[9].id).toBe('approved-6');expect((await module.get(PlatformService).courseQueue('Draft')).recentlyApproved).toEqual([]);
 });
 it('creates linked accounts for all three registration roles with distinct IDs and working sign-in',async()=>{
  const auth=module.get(AuthService),workspace=module.get(WorkspaceService);const roles=['Student','Instructor','Organization'] as const;const results=await Promise.all(roles.map(role=>auth.register({name:'New '+role,email:role.toLowerCase()+'@new.test',password:'Password123!',role})));expect(new Set(results.map(r=>r.user.id)).size).toBe(3);
  for(let i=0;i<roles.length;i++){if(roles[i]==='Organization'){await expect(auth.login({email:'organization@new.test',password:'Password123!'})).rejects.toThrow('verification');await module.get(PlatformService).verifyOrganization(results[i].user.id,{decision:'approve'},{id:'admin',name:'Admin',role:'Admin'});}const signed=await auth.login({email:roles[i].toUpperCase()+'@NEW.TEST',password:'Password123!',role:roles[i]});expect(signed.user.id).toBe(results[i].user.id);expect((await workspace.identity({'x-user-id':signed.user.id})).profileId).toBeTruthy();expect(results[i].user).not.toHaveProperty('password');}
  await expect(auth.register({name:'Duplicate',email:'student@new.test',password:'Password123!',role:'Student'})).rejects.toThrow('already exists');await expect(auth.register({name:' ',email:'empty@new.test',password:'Password123!',role:'Student'})).rejects.toThrow('name');await expect(auth.register({name:'Admin',email:'newadmin@new.test',password:'Password123!',role:'Admin'})).rejects.toThrow('Administrator');await expect(auth.login({email:'student@new.test',password:'WrongPass123!',role:'Student'})).rejects.toThrow('Invalid');await expect(auth.login({email:'student@new.test',password:'Password123!',role:'Instructor'})).rejects.toThrow('selected role');
 });
 it('exposes only explicitly configured demo credentials and disables them in production by default',async()=>{
  await db.setCollection('demo_accounts',[{id:'demo-student',role:'Student',userId:'u1',password:'Password123!'}]);const platform=module.get(PlatformService);expect(await platform.demoCredentials('Student')).toMatchObject({email:'nishanth@test.com',password:'Password123!'});expect(await platform.demoCredentials('Admin')).toBeNull();const previous=process.env.NODE_ENV,enabled=process.env.ENABLE_DEMO_LOGIN;try{process.env.NODE_ENV='production';delete process.env.ENABLE_DEMO_LOGIN;expect(await platform.demoCredentials('Student')).toBeNull();}finally{process.env.NODE_ENV=previous;if(enabled===undefined)delete process.env.ENABLE_DEMO_LOGIN;else process.env.ENABLE_DEMO_LOGIN=enabled;}
 });
 it('does not allow a profile-only identity to bypass account password validation',async()=>{await db.setCollection('instructors',[{id:'orphan',name:'Unlinked instructor',email:'profile-only@test.com',status:'Active'}]);await expect(module.get(AuthService).login({email:'profile-only@test.com',password:'Password123!',role:'Instructor'})).rejects.toThrow('Invalid');const rows=await db.getCollection<any>('users');delete rows[0].password;await db.setCollection('users',rows);await expect(module.get(AuthService).login({email:'nishanth@test.com',password:'Password123!',role:'Student'})).rejects.toThrow('Invalid');});
 it('returns explicit demo media labels from stored curriculum',async()=>{const rows=await db.getCollection<any>('courses');Object.assign(rows[0].modules[0].items[0],{isDemo:true,mediaLabel:'Demo video',videoUrl:'/uploads/course-demo.mp4'});await db.setCollection('courses',rows);expect((await service.content('u1','c1')).lessons[0]).toMatchObject({isDemo:true,mediaLabel:'Demo video',videoUrl:'/uploads/course-demo.mp4'});});

 it('assigns courses immediately without acceptance requests and only publishes approved content changes',async()=>{
  const users=await db.getCollection<any>('users');users.push({id:'teacher2',role:'Instructor',name:'Shameer',email:'shameer@test.com',status:'Active'});await db.setCollection('users',users);const teachers=await db.getCollection<any>('instructors');teachers.push({id:'inst2',userId:'teacher2',name:'Shameer',email:'shameer@test.com',organizationId:'org',status:'Active'});await db.setCollection('instructors',teachers);await db.setCollection('instructor_requests',[]);
  const workflow=module.get(CourseWorkflowService),workspace=module.get(WorkspaceService);const organization={id:'organization-user',profileId:'org',canonicalRole:'organization',name:'Institute'};const actor=await workspace.identity({'x-user-id':'teacher2'});await expect(workflow.editor('c2',actor)).rejects.toThrow('not assigned');
  await workflow.assign({courseIds:['c2'],instructorIds:['inst2']},organization);expect(await db.getCollection('instructor_requests')).toEqual([]);expect((await workspace.instructorWorkspace(actor)).courses.map(c=>c.id)).toEqual(['c2']);expect((await db.getCollection<any>('notifications')).some(n=>n.category==='CourseAssignment'&&n.recipientId==='inst2')).toBe(true);
  const modules=[{id:'module',title:'New module',items:[{id:'new',title:'New reading',type:'Reading',content:'Approved learning content'}]}];await workflow.saveDraft('c2',{modules},actor);expect((await workflow.editor('c2',actor)).modules).toEqual(modules);expect((await service.content('u2','c2')).lessons).toEqual([]);await workflow.saveDraft('c2',{modules:[...modules,{id:'second',title:'Second module',items:[]}]},actor);expect(await workflow.list(actor)).toEqual([]);
  const request=await workflow.request('c2',{modules},actor);expect((await service.content('u2','c2')).lessons).toEqual([]);expect((await workflow.editor('c2',actor)).pendingModuleRequest.id).toBe(request.id);await workflow.decide(request.id,{decision:'approve'},organization);expect((await service.content('u2','c2')).lessons[0].description).toBe('Approved learning content');expect((await workflow.editor('c2',actor)).pendingModuleRequest).toBeNull();
 });
 it('recognizes co-instructor and legacy profile IDs consistently in workspace and editor permission checks',async()=>{
  const users=await db.getCollection<any>('users');users.push({id:'teacher',role:'Instructor',name:'Teacher',email:'teacher@test.com',status:'Active'});await db.setCollection('users',users);await db.setCollection('instructors',[{id:'inst',userId:'teacher',name:'Teacher',email:'teacher@test.com',organizationId:'org',status:'Active',legacyIds:['legacy-inst']}]);const courses=await db.getCollection<any>('courses');courses[0].instructorId='someone-else';courses[0].coInstructorIds=['legacy-inst'];courses[0].instructors=[];await db.setCollection('courses',courses);const workspace=module.get(WorkspaceService);const actor=await workspace.identity({'x-user-id':'teacher'});expect(actor.aliases).toContain('legacy-inst');expect((await workspace.instructorWorkspace(actor)).courses.some(c=>c.id==='c1')).toBe(true);expect((await module.get(CourseWorkflowService).editor('c1',actor)).id).toBe('c1');
 });
 it('keeps a new course off the learner catalog until organization submission and admin approval',async()=>{
  const workflow=module.get(CourseWorkflowService),platform=module.get(PlatformService);const courses=await db.getCollection<any>('courses');courses[1].status='Draft';await db.setCollection('courses',courses);const instructor={id:'teacher',profileId:'inst',organizationId:'org',aliases:['inst'],canonicalRole:'instructor',name:'Teacher'},organization={id:'organization-user',profileId:'org',canonicalRole:'organization',name:'Institute'};
  const request=await workflow.request('c2',{modules:[{id:'m',title:'Prepared module',items:[{id:'lesson',title:'Lesson',type:'Reading',content:'Approved text'}]}]},instructor);await workflow.decide(request.id,{decision:'approve'},organization);expect((await workflow.course('c2')).status).toBe('Draft');await expect(service.getCatalogCourse('c2')).rejects.toThrow('not available');await workflow.submit('c2',organization);expect((await workflow.course('c2')).status).toBe('Pending Approval');await expect(service.getCatalogCourse('c2')).rejects.toThrow('not available');await platform.review('c2',{decision:'approve'},{id:'admin',name:'Suhaas'});expect((await service.getCatalogCourse('c2')).status).toBe('Published');
 });
 it('blocks cross-organization assignments and decisions without changing course teams',async()=>{
  const workflow=module.get(CourseWorkflowService);const before=await db.getCollection('courses');await expect(workflow.assign({courseIds:['c1'],instructorIds:['inst']},{id:'wrong-org',profileId:'other',canonicalRole:'organization'})).rejects.toThrow('organization');expect(await db.getCollection('courses')).toEqual(before);const request=await workflow.request('c1',{modules:[]},{id:'teacher',profileId:'inst',organizationId:'org',aliases:['inst'],canonicalRole:'instructor'});await expect(workflow.decide(request.id,{decision:'approve'},{id:'wrong-org',profileId:'other',canonicalRole:'organization'})).rejects.toThrow('owning organization');expect((await workflow.course('c1')).modules).toEqual((before[0] as any).modules);
 });
 it('does not let an instructor publish assessments or modify a live assessment without approval',async()=>{
  const users=await db.getCollection<any>('users');users.push({id:'teacher',role:'Instructor',name:'Teacher',email:'teacher@test.com',status:'Active'});await db.setCollection('users',users);await db.setCollection('instructors',[{id:'inst',userId:'teacher',name:'Teacher',email:'teacher@test.com',organizationId:'org',status:'Active'}]);const controller=module.get(QuizzesController);const draft=await controller.create({courseId:'c1',title:'Draft assessment',status:'Published'} as any,'teacher');expect(draft.status).toBe('Draft');await db.setCollection('quizzes',[{id:'live',courseId:'c1',title:'Live assessment',status:'Published',passingScore:80}]);await db.setCollection('quiz_questions',[{id:'live-question',quizId:'live',questionText:'Original question',optionA:'A',optionB:'B',correctOption:'B'}]);
  const copy=await controller.update('live',{title:'Proposed revision',status:'Published',questions:[{text:'New question',options:[{text:'A',isCorrect:true},{text:'B',isCorrect:false}]}]},'teacher');expect(copy.id).not.toBe('live');expect(copy.status).toBe('Draft');expect((await service.assessment('u1','c1')).questions[0].text).toBe('Original question');const workflow=module.get(CourseWorkflowService);const actor=await module.get(WorkspaceService).identity({'x-user-id':'teacher'});const request=await workflow.request('c1',{modules:[{id:'m',title:'Assessment module',items:[{id:'newquiz',type:'Quiz',title:'Assessment',quizId:copy.id}]}]},actor);await workflow.decide(request.id,{decision:'approve'},{id:'organization-user',profileId:'org',canonicalRole:'organization',name:'Institute'});expect((await db.getCollection<any>('quizzes')).find(q=>q.id===copy.id).status).toBe('Published');
  await expect(module.get(CoursesController).updatePartial('c1',{status:'Published'} as any,{headers:{'x-user-id':'teacher'}})).rejects.toThrow('organization approval');
 });

 it('preserves real lesson content through backend DTO validation instead of stripping module items',async()=>{const modules=[{id:7,title:'Actual module',description:'Details',objectives:['Learn'],items:[{id:'lesson',type:'Video',title:'Recorded lesson',videoUrl:'/uploads/course-demo.mp4'}]}];const value=await new ValidationPipe({whitelist:true,transform:true,transformOptions:{enableImplicitConversion:true}}).transform({modules},{type:'body',metatype:UpdateCourseDto});expect(value.modules[0].items[0].videoUrl).toBe('/uploads/course-demo.mp4');expect(Array.isArray(value.modules[0].items[0])).toBe(false);expect(JSON.parse(JSON.stringify(value)).modules[0].items[0].videoUrl).toBe('/uploads/course-demo.mp4');expect(value.modules[0].id).toBe(7);});

 it('prevents another institute’s instructor from being added through either assignment or course editing',async()=>{
  const teachers=await db.getCollection<any>('instructors');teachers.push({id:'foreign-teacher',name:'Raghuveer',organizationId:'other-org',status:'Active'});await db.setCollection('instructors',teachers);const organization={id:'org-user',profileId:'org',canonicalRole:'organization',name:'Institute'};const workflow=module.get(CourseWorkflowService);expect((await workflow.assignmentOptions(organization)).instructors.map(i=>i.id)).toEqual(['inst']);const before=await db.getCollection('courses');await expect(workflow.assign({courseIds:['c1'],instructorIds:['foreign-teacher']},organization)).rejects.toThrow('in your organization');
  const users=await db.getCollection<any>('users');users.push({id:'org-user',role:'Organization',organizationId:'org',name:'Institute',email:'org@test.com',status:'Active'});await db.setCollection('users',users);await expect(module.get(CoursesController).updatePartial('c1',{instructorId:'foreign-teacher',instructors:[{id:'foreign-teacher',name:'Fake display name'}]} as any,{headers:{'x-user-id':'org-user'}})).rejects.toThrow('from this course');expect(await db.getCollection('courses')).toEqual(before);
 });
 it('does not publish an old curriculum request after the instructor leaves the institute',async()=>{const workflow=module.get(CourseWorkflowService);const request=await workflow.request('c1',{modules:[{id:'new',title:'Requested module',items:[]}]},{id:'teacher',profileId:'inst',organizationId:'org',aliases:['inst'],canonicalRole:'instructor'});const teachers=await db.getCollection<any>('instructors');teachers[0].organizationId='other-institute';await db.setCollection('instructors',teachers);await expect(workflow.decide(request.id,{decision:'approve'},{id:'org-user',profileId:'org',canonicalRole:'organization'})).rejects.toThrow('still be active and assigned');expect((await db.getCollection<any>('courses'))[0].modules[0].id).toBe('m1');});
 it('rejects archive operations without changing courses or payment history',async()=>{
  const workflow=module.get(CourseWorkflowService);const actor={id:'org-user',profileId:'org',canonicalRole:'organization'};const courses=await db.getCollection('courses'),payments=await db.getCollection('transactions');await expect(workflow.archive('c1',actor)).rejects.toThrow('no longer available');await expect(workflow.restore('c1',actor)).rejects.toThrow('no longer available');expect(await db.getCollection('courses')).toEqual(courses);expect(await db.getCollection('transactions')).toEqual(payments);
 });
 it('renders organization learner activity only from real, organization-scoped records',async()=>{
  const workspace=module.get(WorkspaceService);await db.setCollection('learning_activity',[{id:'event',courseId:'c1',learnerId:'l1',seconds:120,createdAt:new Date().toISOString()},{id:'foreign-event',courseId:'not-owned',learnerId:'l1',seconds:50000,createdAt:new Date().toISOString()}]);const data=await workspace.organizationLearner({canonicalRole:'organization',profileId:'org'},'l1');expect(data.learner.name).toBe('Nishanth');expect(data.activity.map(e=>e.id)).toEqual(['event']);expect(data.stats.engagementHours).toBe(0.03);await expect(workspace.organizationLearner({canonicalRole:'organization',profileId:'other'},'l1')).rejects.toThrow('not enrolled');
 });

});
