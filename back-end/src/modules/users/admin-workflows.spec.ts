import {PlatformService} from '../platform/platform.service';
import {CertificatesController} from '../certificates/certificates.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../../app.module';
import { JsonRepository } from '../../database/json-repository';
import { JsonDatabaseService } from '../../database/json-db.service';
import { UsersService } from './users.service';
import { AccountAccessGuard } from '../../common/guards/account-access.guard';
import { DisputesService } from '../disputes/disputes.service';
import { AuthService } from '../auth/auth.service';
import { StudentService } from '../student/student.service';
import { OrganizationService } from '../organization/organization.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { CertificatesService } from '../certificates/certificates.service';
import { InstructorsController } from '../instructors/instructors.controller';

const password = 'Password123!';
describe('Admin workflows with shared JSON persistence', () => {
  let module: TestingModule;
  let db: JsonDatabaseService;
  let users: UsersService;
  let dir: string;
  let previous: string | undefined;
  beforeAll(async () => {
    previous = process.env.DATA_DIR;
    dir = await mkdtemp(join(tmpdir(), 'admin-workflow-'));
    process.env.DATA_DIR = dir;
    module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    db = module.get(JsonDatabaseService);
    await db.onModuleInit();
    users = module.get(UsersService);
  });
  beforeEach(async () => {
    const fixtures: Record<string, any[]> = {
      users: [
        { id: 'u-learner', name: 'Learner', email: 'learner@test.com', role: 'Student', status: 'Active', password },
        { id: 'u-org', name: 'Institution', email: 'org@test.com', role: 'Organization', organizationId: 'o-1', status: 'Active', password },
        { id: 'u-instructor', name: 'Teacher', email: 'teacher@test.com', role: 'Instructor', organizationId: 'o-1', status: 'Active', password },
      ],
      learners: [{ id: 'l-1', userId: 'u-learner', name: 'Learner', email: 'learner@test.com', status: 'Active' }, { id: 'l-orphan', name: 'Independent learner', email: 'orphan@test.com', status: 'Active' }],
      organizations: [{ id: 'o-1', name: 'Institution', email: 'org@test.com', status: 'Active' }, { id: 'o-orphan', name: 'Independent institution', email: 'orphan-org@test.com', status: 'Active' }],
      instructors: [{ id: 'i-1', userId: 'u-instructor', name: 'Teacher', email: 'teacher@test.com', organizationId: 'o-1', status: 'Active' }],
      courses: [{ id: 'c-1', title: 'Actual course', organizationId: 'o-1', instructorId: 'i-1', status: 'Published', price: 20 }],
      enrollments: [{ id: 'e-1', learnerId: 'l-1', courseId: 'c-1', status: 'Active', progress: 35 }],
      certificates: [{ id: 'cert-1', credentialId: 'CREDENTIAL-1', learnerId: 'l-1', courseId: 'c-1', learnerName: 'Old name', courseTitle: 'Actual course', status: 'Verified' }],
      transactions: [{ id: 't-1', payerId: 'l-1', courseId: 'c-1', type: 'Payment', amount: 20, status: 'Completed' }],
      notifications: [
        { id: 'n-admin', title: 'Admin ticket', recipientRole: 'admin', read: false },
        { id: 'n-global', title: 'Global', recipientRole: 'all', read: false },
        { id: 'n-legacy', title: 'Operations', read: false },
        { id: 'n-teacher', title: 'Private teaching update', recipientRole: 'instructor', recipientId: 'i-1', read: false },
      ],
      disputes: [{ id: 'd-1', subject: 'Course issue', status: 'Open', comments: [], timeline: [] }],
      settings: [{ id: 's-1', emailAlerts: true, weeklyDigest: false, defaultCurrency: 'USD' }],
    };
    for (const [collection, records] of Object.entries(fixtures)) await db.setCollection(collection, records);
  });
  afterAll(async () => {
    await module?.close();
    if (previous === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = previous;
    if (dir) await rm(dir, { recursive: true, force: true });
  });
  it('includes learners and organizations without login records and deduplicates linked accounts', async () => {
    expect((await users.findAll('Learner')).map(u => u.id)).toEqual(['u-learner', 'l-orphan']);
    expect((await users.findAll('Organization')).map(u => u.id)).toEqual(['u-org', 'o-orphan']);
  });
  it('joins learner enrollments and organization faculty using the real profile IDs', async () => {
    const learner = await users.findOne('u-learner');
    expect(learner.password).toBeUndefined();
    expect(learner.enrollments[0].course).toBe('Actual course');
    expect(learner.enrollments[0].progress).toBe(35);
    const org = await users.findOne('o-1');
    expect(org.courses[0].id).toBe('c-1');
    expect(org.orgInstructors[0].name).toBe('Teacher');
  });
  it('ignores a stale organization roster and excludes archived courses in admin and super admin details',async()=>{
    const organizations=await db.getCollection<any>('organizations');organizations[0].instructorIds=['i-1','raghu'];await db.setCollection('organizations',organizations);
    const teachers=await db.getCollection<any>('instructors');teachers.push({id:'raghu',name:'Raghuveer',email:'raghuveer@iisc.ac.in',organizationId:'o-orphan',bio:'Previously worked with Institution',status:'Active'});await db.setCollection('instructors',teachers);
    const courses=await db.getCollection<any>('courses');courses.push({id:'old',title:'Old course',status:'Archived',organizationId:'o-1',instructorId:'i-1'});await db.setCollection('courses',courses);
    for(const role of ['Admin','SuperAdmin']){const result=await module.get(PlatformService).accountDetail('u-org',{role});expect(result.orgInstructors.map(i=>i.id)).toEqual(['i-1']);expect(result.courses.map(c=>c.id)).toEqual(['c-1']);expect(result.orgInstructors[0].courses).toBe(1);}
    const orgs=await module.get(OrganizationService).findAllOrgs();expect(orgs.find(o=>o.id==='o-1').instructors.map(i=>i.id)).toEqual(['i-1']);
    expect((await module.get(PlatformService).courses({} as any)).items.some(c=>c.id==='old')).toBe(false);
  });
  it('uses identical current certificate data and PDF bytes for learner and administrator views',async()=>{
    await db.setCollection('enrollments',[{id:'e-1',learnerId:'l-1',courseId:'c-1',status:'Completed',progress:100}]);
    const certs=await db.getCollection<any>('certificates');Object.assign(certs[0],{courseTitle:'Old course name',institution:'Wrong institution',instructorName:'Old instructor'});await db.setCollection('certificates',certs);
    const service=module.get(CertificatesService),student=module.get(StudentService);
    const learnerCert=(await student.getCertificates('u-learner'))[0],adminCert=await service.findOne('cert-1');expect(adminCert).toEqual(learnerCert);expect(adminCert).toMatchObject({learnerName:'Learner',courseTitle:'Actual course',institution:'Institution',instructorName:'Teacher'});
    expect(await service.download('cert-1')).toEqual(await student.downloadCertificate('u-learner','cert-1'));
    const controller=module.get(CertificatesController);await expect(controller.download('cert-1','u-learner','')).rejects.toThrow('Administrator');
    const accounts=await db.getCollection<any>('users');accounts.push({id:'admin-download',role:'Admin',status:'Active'});await db.setCollection('users',accounts);expect((await controller.download('cert-1','admin-download','')).mimeType).toBe('application/pdf');
  });
  it('suspends learner login and existing learner data access; restoration persists', async () => {
    await users.update('u-learner', { status: 'Suspended' });
    await expect(module.get(AuthService).login({ email: 'learner@test.com', password, role: 'Student' })).rejects.toThrow('suspended');
    await expect(module.get(StudentService).getProfile('u-learner')).rejects.toThrow('suspended');
    expect((await db.getCollection<any>('learners'))[0].status).toBe('Suspended');
    await users.update('u-learner', { status: 'Active' });
    expect((await module.get(StudentService).getProfile('u-learner')).name).toBe('Learner');
  });
  it('suspends organization access through either its profile ID or login ID', async () => {
    await users.update('o-1', { status: 'Suspended' });
    await expect(module.get(AuthService).login({ email: 'org@test.com', password, role: 'Organization' })).rejects.toThrow('suspended');
    await expect(module.get(OrganizationService).getProfile('u-org')).rejects.toThrow('suspended');
    await users.update('u-org', { status: 'Active' });
    expect((await module.get(OrganizationService).getProfile('u-org')).id).toBe('o-1');
  });
  it('blocks instructor suspension and deletion on both admin API paths', async () => {
    await expect(users.update('u-instructor', { status: 'Suspended' })).rejects.toThrow();
    await expect(users.remove('u-instructor')).rejects.toThrow();
    await expect(module.get(InstructorsController).delete('i-1', 'admin')).rejects.toThrow();
    expect((await db.getCollection<any>('instructors'))[0].status).toBe('Active');
  });
  it('deletes a learner account and profile while preserving historical enrollments', async () => {
    await users.remove('l-1');
    await expect(users.findOne('u-learner')).rejects.toThrow();
    await expect(module.get(StudentService).getProfile('u-learner')).rejects.toThrow();
    expect((await db.getCollection<any>('learners')).map(l => l.id)).toEqual(['l-orphan']);
    expect((await db.getCollection<any>('enrollments')).length).toBe(1);
    await expect(module.get(CertificatesService).findOne('cert-1')).rejects.toThrow('not found');
    expect(await db.getCollection('certificates')).toHaveLength(1);
  });
  it('deletes only the selected orphan profile', async () => {
    await users.remove('l-orphan');
    expect((await db.getCollection<any>('learners')).map(l => l.id)).toEqual(['l-1']);
    expect((await users.findOne('u-learner')).name).toBe('Learner');
  });
  it('removes an organization, archives courses, and detaches rather than deleting instructors', async () => {
    await users.remove('u-org');
    await expect(users.findOne('o-1')).rejects.toThrow();
    const instructors = await db.getCollection<any>('instructors');
    expect(instructors).toHaveLength(1);
    expect(instructors[0].organizationId).toBeNull();
    expect(instructors[0].status).toBe('Pending Affiliation');
    expect((await db.getCollection<any>('courses'))[0].status).toBe('Archived');
  });
  it('persists settings across database reloads', async () => {
    await module.get(SettingsService).updateSettings({ weeklyDigest: true, defaultCurrency: 'INR' });
    const fresh = new JsonDatabaseService();
    expect((await fresh.getCollection<any>('settings'))[0]).toMatchObject({ weeklyDigest: true, defaultCurrency: 'INR' });
  });
  it('marks admin notifications read without touching instructor messages', async () => {
    const service = module.get(NotificationsService);
    expect((await service.findAll({ role: 'admin' })).items.map(n => n.id).sort()).toEqual(['n-admin', 'n-global', 'n-legacy']);
    await service.markAllAsRead({ role: 'admin' });
    const rows = await db.getCollection<any>('notifications');
    expect(rows.find(n => n.id === 'n-admin').read).toBe(true);
    expect(rows.find(n => n.id === 'n-teacher').read).toBe(false);
  });
  it('creates notifications visible to the selected actor through the same JSON data', async () => {
    await module.get(NotificationsService).create({ title: 'Learner update', desc: 'Actual message', recipientRole: 'student' });
    const learnerFeed = await module.get(NotificationsService).findAll({ role: 'student' });
    expect(learnerFeed.items.some(n => n.title === 'Learner update')).toBe(true);
  });
  it('returns current learner identity for a completed-course certificate list, view, and verification', async () => {
    await new JsonRepository<any>('enrollments',db).update('e-1',{status:'Completed',progress:100});
    const service = module.get(CertificatesService);
    const list = await service.findAll();
    expect(list[0]).toMatchObject({ learnerName: 'Learner', learnerEmail: 'learner@test.com', courseTitle: 'Actual course' });
    expect((await service.findOne('cert-1')).learnerEmail).toBe('learner@test.com');
    expect((await service.verify('CREDENTIAL-1')).certificate.learnerName).toBe('Learner');
  });
  it('rejects suspended and deleted sessions across protected actor endpoints', async () => {
    const guard = new AccountAccessGuard(
      new JsonRepository('users', db),
      new JsonRepository('learners', db),
      new JsonRepository('instructors', db),
      new JsonRepository('organizations', db),
    );
    const context = (path = '/api/reviews/my') => ({ switchToHttp: () => ({ getRequest: () => ({ path, headers: { authorization: 'Bearer jwt-token-u-learner-123', 'x-user-id': 'u-learner' } }) }) }) as any;
    expect(await guard.canActivate(context())).toBe(true);
    await users.update('u-learner', { status: 'Suspended' });
    await expect(guard.canActivate(context())).rejects.toThrow('suspended');
    expect(await guard.canActivate(context('/api/auth/login'))).toBe(true);
    await users.remove('u-learner');
    await expect(guard.canActivate(context())).rejects.toThrow('no longer exists');
  });
  it('persists dispute comments, resolution and rejection', async () => {
    const service = module.get(DisputesService);
    const commented = await service.addComment('d-1', { author: 'Admin', message: 'Review note', isAdmin: true });
    expect(commented.comments[0].message).toBe('Review note');
    const resolved = await service.resolve('d-1', { resolutionNote: 'Corrected lesson', resolvedBy: 'Admin' });
    expect(resolved.status).toBe('Resolved');
    expect(resolved.timeline.some(item => item.message.includes('Corrected lesson'))).toBe(true);
    const rejected = await service.reject('d-1', { rejectionReason: 'Duplicate ticket', resolvedBy: 'Admin' });
    expect(rejected.status).toBe('Rejected');
    expect((await new JsonDatabaseService().getCollection<any>('disputes'))[0].rejectionReason).toBe('Duplicate ticket');
  });
  it('does not register refund endpoints', async () => {
    const app = module.createNestApplication({ logger: false });
    const docs = SwaggerModule.createDocument(app, new DocumentBuilder().build());
    expect(Object.keys(docs.paths).some(route => route.startsWith('/refunds'))).toBe(false);
    // module.close() owns the shared module lifetime.
  });
});
