import { Test, TestingModule } from '@nestjs/testing';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { AppModule } from '../../app.module';
import { PlatformService } from './platform.service';
import { WorkspaceService } from './workspace.service';
import { CourseWorkflowService } from '../courses/course-workflow.service';
import { ReviewsService } from '../reviews/reviews.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { JsonDatabaseService } from '../../database/json-db.service';
import { AuthService } from '../auth/auth.service';
import { AccountAccessGuard } from '../../common/guards/account-access.guard';
import { JsonRepository } from '../../database/json-repository';
import { validate } from 'class-validator';
import { CourseDecision } from './platform.dto';
describe('JSON-backed admin and public platform', () => {
    let module: TestingModule, service: PlatformService, db: JsonDatabaseService, dir: string;
    let previous: string | undefined;
    const admin = { id: 'a', name: 'Actual Admin', role: 'Admin', email: 'admin@test.com', status: 'Active', password: 'Password123!' };
    beforeAll(async () => {
        previous = process.env.DATA_DIR;
        dir = await mkdtemp(join(tmpdir(), 'platform-check-'));
        process.env.DATA_DIR = dir;
        module = await Test.createTestingModule({ imports: [AppModule] }).compile();
        db = module.get(JsonDatabaseService);
        await db.onModuleInit();
        service = module.get(PlatformService);
    });
    beforeEach(async () => {
        const fixtures = {
            users: [admin, { id: 'u', role: 'Student', name: 'Learner', email: 'learner@test.com', status: 'Active', password: 'Password123!' }, ...['Instructor', 'Organization', 'SuperAdmin'].map((role, i) => ({ id: `role-${i}`, role, name: role, email: `${role.toLowerCase()}@test.com`, status: 'Active', password: 'Password123!' }))],
            learners: [{ id: 'l', userId: 'u', name: 'Real Learner', status: 'Active' }], organizations: [{ id: 'o', name: 'Real School' }], instructors: [{ id: 'i', name: 'Real Teacher', email: 'teacher@test.com', organizationId: 'o', status: 'Active' }],
            courses: [{ id: 'c', title: 'Actual Course', instructorId: 'i', organizationId: 'o', status: 'Pending Approval', rating: 5, enrolledCount: 99, modules: [{ title: 'Real module', lessons: 4 }], price: 10 }, { id: 'draft', title: 'Draft course', status: 'Draft' }, { id: 'published', title: 'Public course', status: 'Published', thumbnail: 'javascript:bad' }],
            enrollments: [{ id: 'e', learnerId: 'l', courseId: 'c', status: 'Active' }], reviews: [], admin_activity: [], certificates: [], module_requests: [],
            notifications: [{ id: 'n', recipientRole: 'admin', read: false }, { id: 'private', recipientRole: 'student', read: false }],
            transactions: [{ id: 't1', payerId: 'l', courseId: 'c', type: 'Payment', status: 'Completed', amount: 10, currency: 'USD' }, { id: 't2', type: 'Payment', status: 'Failed', amount: 200, currency: 'USD' }, { id: 't3', type: 'Payment', status: 'Pending', amount: 300 }, { id: 't4', type: 'Payout', status: 'Completed', amount: 400, currency: 'USD' }, { id: 't5', type: 'Payment', status: 'Completed', amount: 20, currency: 'INR' }, { id: 't6', type: 'Payment', status: 'Completed', amount: 5 }, { id: 'refund', type: 'Refund', status: 'Completed', amount: 50 }],
        };
        for (const [name, rows] of Object.entries(fixtures))
            await db.setCollection(name, rows);
    });
    afterAll(async () => { await module?.close(); if (previous === undefined)
        delete process.env.DATA_DIR;
    else
        process.env.DATA_DIR = previous; await rm(dir, { recursive: true, force: true }); });
    it('retains actual admin roles and denies absent or non-admin accounts', async () => {
        expect((await service.account({ 'x-user-id': 'a' })).role).toBe('Admin');
        await expect(service.account({ 'x-user-id': 'u' })).rejects.toThrow('Admin access');
        await expect(service.account({})).rejects.toThrow('Sign in');
        expect((await service.session(admin)).unreadNotifications).toBe(1);
    });
    it('joins actual course relationships and computes enrollment and review counts', async () => {
        const c = await service.course('c');
        expect(c.organizationName).toBe('Real School');
        expect(c.instructors[0].name).toBe('Real Teacher');
        expect(c.enrolledCount).toBe(1);
        expect(c.rating).toBeNull();
        expect(c.lessonsCount).toBe(4);
        expect(c.currency).toBeNull();
        expect((await service.courses({ search: 'Real Teacher' })).total).toBe(1);
    });
    it('persists approval without changing modules and rejects repeat or draft decisions', async () => {
        const c = await service.review('c', { decision: 'approve' }, admin);
        expect(c.status).toBe('Published');
        expect(c.modules[0].lessons).toBe(4);
        expect((await db.getCollection<any>('admin_activity'))[0].adminId).toBe('a');
        await expect(service.review('c', { decision: 'approve' }, admin)).rejects.toThrow('Only submitted');
        await expect(service.review('draft', { decision: 'approve' }, admin)).rejects.toThrow('Only submitted');
    });
    it('requires a rejection reason and existing instructor for publication', async () => {
        await expect(service.review('c', { decision: 'reject', reason: '  ' }, admin)).rejects.toThrow('reason');
        await db.setCollection('instructors', []);
        await expect(service.review('c', { decision: 'approve' }, admin)).rejects.toThrow('instructor');
        expect((await service.review('c', { decision: 'reject', reason: 'Missing lesson' }, admin)).reviewNote).toBe('Missing lesson');
    });
    it('validates approval with no reason and rejection with a required reason', async () => {
        expect(await validate(Object.assign(new CourseDecision(), { decision: 'approve' }))).toHaveLength(0);
        expect((await validate(Object.assign(new CourseDecision(), { decision: 'reject' }))).length).toBeGreaterThan(0);
    });
    it('excludes payouts, failed and pending payments from totals and keeps currencies separate', async () => {
        const p = await service.payments({});
        expect(p.total).toBe(6);
        expect(p.summary.completedPayments).toBe(3);
        expect(p.summary.totals).toEqual(expect.arrayContaining([{ currency: 'USD', amount: 10 }, { currency: 'INR', amount: 20 }, { currency: null, amount: 5 }]));
        expect((await service.overview()).stats.pendingApprovals).toBe(1);
    });
    it('exports all filtered records and safely quotes spreadsheet cells', async () => {
        await db.setCollection('transactions', [{ id: 'x', payer: '=SUM(1,2)', course: 'A "quoted", course\nnext line', type: 'Payment', amount: 1, status: 'Completed' }, { id: 'y', type: 'Payment', amount: 2, status: 'Completed' }]);
        const file = await service.exportPayments({ page: 2, limit: 1 });
        expect(file.content).toContain('"x"');
        expect(file.content).toContain('"y"');
        expect(file.content).toContain('"\'=SUM(1,2)"');
        expect(file.content).toContain('"A ""quoted"", course\nnext line"');
    });
    it('saves profile without role promotion and rejects duplicate emails', async () => {
        const p = await service.updateProfile(admin, { name: ' Updated Admin ' });
        expect(p.name).toBe('Updated Admin');
        expect(p.role).toBe('Admin');
        await expect(service.updateProfile(admin, { email: 'learner@test.com' })).rejects.toThrow('already in use');
    });
    it('exposes only published landing records without identities or fabricated reviews', async () => {
        await db.setCollection('reviews', [{ id: 'r', courseId: 'published', rating: 4, comment: 'Recorded feedback', learnerEmail: 'private@test.com' }, { id: 'hidden', courseId: 'draft', rating: 5, comment: 'Draft feedback' }]);
        const data = await service.landing();
        expect(data.courses.map(c => c.id)).toEqual(['published']);
        expect(data.courses[0].thumbnail).toBeNull();
        expect(data.stats.learners).toBe(1);
        expect(data.reviews).toEqual([{ id: 'r', rating: 4, comment: 'Recorded feedback', course: 'Public course' }]);
        expect(JSON.stringify(data)).not.toContain('private@test.com');
    });
    it('keeps public landing reachable with an obsolete local session', async () => {
        const repo = (name: string) => new JsonRepository(name, db);
        const guard = new AccountAccessGuard(repo('users'), repo('learners'), repo('instructors'), repo('organizations'));
        expect(await guard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ path: '/api/public/landing', headers: { authorization: 'Bearer jwt-token-deleted-123', 'x-user-id': 'deleted' } }) }) } as any)).toBe(true);
    });
    it.each(['Student', 'Instructor', 'Organization', 'Admin', 'SuperAdmin'])('resolves %s from credentials without a selected role', async (role) => {
        const email = role === 'Admin' ? admin.email : role === 'Student' ? 'learner@test.com' : `${role.toLowerCase()}@test.com`;
        const result = await module.get(AuthService).login({ email, password: 'Password123!' });
        expect(result.user.role).toBe(role);
        expect(result.token).toBeTruthy();
    });
    it('lists only valid demo accounts and retains the single-role response', async () => {
        await db.setCollection('demo_accounts', [
            {id:'demo-a',role:'Admin',userId:'a',password:'Password123!'},
            {id:'demo-u',role:'Student',userId:'u',password:'Password123!'},
            {id:'demo-i',role:'Instructor',userId:'role-0',password:'wrong'},
        ]);
        expect(await service.demoCredentials()).toEqual([
            {role:'Admin',name:admin.name,email:admin.email,password:'Password123!'},
            {role:'Student',name:'Learner',email:'learner@test.com',password:'Password123!'},
        ]);
        expect(await service.demoCredentials('Admin')).toEqual({role:'Admin',name:admin.name,email:admin.email,password:'Password123!'});
        expect(await service.demoCredentials('Instructor')).toBeNull();
    });
    it.each(['Student', 'Instructor', 'Organization', 'Admin', 'SuperAdmin'])('preserves backend credential login for %s', async (role) => {
        const email = role === 'Student' ? 'learner@test.com' : role === 'Admin' ? 'admin@test.com' : `${role.toLowerCase()}@test.com`;
        const result = await module.get(AuthService).login({ email, password: 'Password123!', role });
        expect(result.token).toBeTruthy();
        expect(result.user.role).toBe(role);
    });
    it('keeps shared announcement reads and dismissals private to each account', async () => {
        const workspace=module.get(WorkspaceService);
        const a=await workspace.identity({'x-user-id':'a'});
        const u=await workspace.identity({'x-user-id':'u'});
        const superAdmin=await workspace.identity({'x-user-id':'role-2'});
        const announcement=await workspace.broadcast(a,{title:'Schedule',desc:'Updated schedule',recipientRole:'all'});
        await workspace.mark(a,announcement.id);
        expect((await workspace.inbox(a)).items.find(n=>n.id===announcement.id).read).toBe(true);
        expect((await workspace.inbox(u)).items.find(n=>n.id===announcement.id).read).toBe(false);
        await workspace.dismiss(a,announcement.id);
        expect((await workspace.inbox(a)).items.some(n=>n.id===announcement.id)).toBe(false);
        expect((await workspace.inbox(superAdmin)).items.some(n=>n.id===announcement.id)).toBe(true);
        await expect(workspace.mark(u,'n')).rejects.toThrow('not found');
        await expect(workspace.broadcast(u,{title:'No',desc:'No',recipientRole:'all'})).rejects.toThrow('administrators');
    });
    it.each(['a','u','role-0','role-1','role-2'])('loads a backend inbox for actor %s without exposing other targeted messages', async id=>{
        const workspace=module.get(WorkspaceService);
        await db.setCollection('notifications',[{id:'targeted',recipientId:'u',read:false}]);
        const identity=await workspace.identity({'x-user-id':id});
        expect((await workspace.inbox(identity)).items.length).toBe(id==='u'?1:0);
    });
    it('calculates payable balances from completed payments and prevents duplicate or excessive payouts', async()=>{
        await db.setCollection('settings',[{id:'policy',platformCommissionRate:0.15}]);
        let finance=await service.finance();
        expect(finance.organizations.find(o=>o.organizationId==='o'&&o.currency==='USD')).toMatchObject({received:10,platformShare:1.5,organizationShare:8.5,due:8.5,paid:0,learners:1});
        await service.payout({organizationId:'o',currency:'USD',amount:3,method:'Bank',reference:'bank-transfer-1'},admin);
        finance=await service.finance();
        expect(finance.organizations.find(o=>o.organizationId==='o'&&o.currency==='USD')).toMatchObject({paid:3,due:5.5});
        await expect(service.payout({organizationId:'o',currency:'USD',amount:6,method:'Bank',reference:'bank-transfer-2'},admin)).rejects.toThrow('exceeds');
        await expect(service.payout({organizationId:'o',currency:'USD',amount:1,method:'Bank',reference:'bank-transfer-1'},admin)).rejects.toThrow('already recorded');
        expect(finance.totals).toContainEqual({currency:null,amount:5});
    });
    it('requires a case note, retains decision history and notifies the affected learner', async()=>{
        await db.setCollection('disputes',[{id:'case',subject:'Access issue',status:'Open',learnerId:'l',timeline:[]}]);
        await expect(service.transitionDispute('case',{status:'Resolved',note:' '},admin)).rejects.toThrow('case note');
        await service.transitionDispute('case',{status:'In Progress',note:'Investigating course access'},admin);
        const resolved=await service.transitionDispute('case',{status:'Resolved',note:'Restored enrollment access'},admin);
        expect(resolved.timeline).toHaveLength(2);
        expect(resolved.resolutionNote).toBe('Restored enrollment access');
        await expect(service.transitionDispute('case',{status:'Rejected',note:'Different outcome'},admin)).rejects.toThrow('Reopen');
        const learner=await module.get(WorkspaceService).identity({'x-user-id':'u'});
        expect((await module.get(WorkspaceService).inbox(learner)).items.some(n=>n.recipientId==='l')).toBe(true);
        expect((await service.transitionDispute('case',{status:'Open',note:'Review new evidence'},admin)).status).toBe('Open');
    });
    it('blocks administrator role management and historical course deletion', async()=>{
        await expect(service.accounts('Admin',admin)).rejects.toThrow('not managed');
        await expect(service.accountDetail('role-2',admin)).rejects.toThrow('not managed');
        await expect(service.removeCourse('c')).rejects.toThrow();
        await expect(service.archiveCourse('c')).rejects.toThrow('owning organization');
        expect((await db.getCollection<any>('enrollments'))[0].courseId).toBe('c');
    });

    it('keeps organization analytics scoped and excludes payouts and invented audit events', async()=>{
        const analytics=module.get(AnalyticsService);
        const scoped=await analytics.getOverview('o');
        expect(scoped.revenueTotals).toEqual([{currency:'USD',amount:10}]);
        expect(scoped.kpis.totalEnrollments).toBe(1);
        expect(scoped.categoryBreakdown[0].seatsEnrolled).toBe(1);
        const executive=await analytics.getSuperAdminAnalytics();
        expect(executive.auditLogs).toEqual([]);
        expect(executive).not.toHaveProperty('systemHealth');
        expect(executive).not.toHaveProperty('revenueSplit');
        const instructor=await analytics.getInstructorAnalytics('i');
        expect(instructor.coursePerformance[0].students).toBe(1);
        expect(instructor.coursePerformance[0].rating).toBeNull();
    });

    it('never substitutes another learner or creates enrollments when reviewing a course',async()=>{
        const reviews=module.get(ReviewsService);
        await expect(reviews.findMy()).rejects.toThrow('Sign in');
        await expect(reviews.create({courseId:'published',rating:5,comment:'Review'},'u')).rejects.toThrow('Enroll');
        expect((await db.getCollection<any>('enrollments')).length).toBe(1);
        const review=await reviews.create({courseId:'c',rating:5,comment:'Recorded learner feedback'},'u');
        expect(review.learnerId).toBe('l');
        expect(review.learnerName).toBe('Real Learner');
        await expect(reviews.delete(review.id,'role-0')).rejects.toThrow('learner profile');
    });

    it.each(['Admin','SuperAdmin'])('enforces ownership and read-only payments for %s',async role=>{
        const actor={id:role==='Admin'?'a':'role-2',role,name:role};
        await expect(service.editAccount('role-1',{email:'changed@test.com'},actor)).rejects.toThrow('account owner');
        await expect(service.editAccount('u',{name:'Someone else'},actor)).rejects.toThrow('account owner');
        await expect(service.createAccount({role:'Organization',name:'Unauthorized org'},actor)).rejects.toThrow('cannot create accounts');
        await expect(service.editTransaction('t1',{currency:'INR'},actor)).rejects.toThrow('read-only');
        expect((await service.editAccount('u',{status:'Suspended'},actor)).status).toBe('Suspended');
        expect((await db.getCollection<any>('users')).find(u=>u.id==='role-1').email).toBe('organization@test.com');
    });
    it('exposes organization financial details and administrator history only to Super Admin',async()=>{
        const users=await db.getCollection<any>('users');users.find(u=>u.id==='role-1').organizationId='o';await db.setCollection('users',users);
        await db.setCollection('admin_activity',[{id:'action',adminId:'a',title:'Reviewed actual course',actionTaken:'Approved',createdAt:new Date().toISOString()}]);
        await db.setCollection('disputes',[{id:'case',subject:'Access',status:'Resolved',assignedTo:'a',resolutionNote:'Access restored'}]);
        const root={id:'role-2',role:'SuperAdmin'};
        expect((await service.accountDetail('role-1',root)).settlements[0].organizationId).toBe('o');
        expect(await service.accountDetail('role-1',admin)).not.toHaveProperty('settlements');
        const detail=await service.accountDetail('a',root);expect(detail.history.actions[0].adminName).toBe('Actual Admin');
        expect(detail.history.cases[0].resolution).toBe('Access restored');
        await expect(service.history(admin)).rejects.toThrow('super administrator');
    });
    it('stages instructor curriculum and releases it only after the owning organization approves',async()=>{
        const workflow=module.get(CourseWorkflowService);
        const teacher={id:'role-0',profileId:'i',organizationId:'o',aliases:['role-0','i'],canonicalRole:'instructor',name:'Teacher'};
        const org={id:'role-1',profileId:'o',aliases:['role-1','o'],canonicalRole:'organization',name:'School'};
        const proposal=[{id:'module-new',title:'New approved module',items:[{id:'lesson-new',title:'New lesson'}]}];
        const before=(await service.course('c')).modules;
        const request=await workflow.request('c',{modules:proposal},teacher);
        expect((await service.course('c')).modules).toEqual(before);
        await expect(workflow.request('c',{modules:proposal},teacher)).rejects.toThrow('already has');
        await expect(workflow.decide(request.id,{decision:'approve'},{...org,profileId:'another-org'})).rejects.toThrow('owning organization');
        await expect(workflow.decide(request.id,{decision:'approve'},{...org,canonicalRole:'admin'})).rejects.toThrow('owning organization');
        await workflow.decide(request.id,{decision:'approve'},org);
        expect((await service.course('c')).modules[0].title).toBe('New approved module');
        expect((await service.course('c')).status).toBe('Pending Approval');
        await expect(workflow.decide(request.id,{decision:'approve'},org)).rejects.toThrow('already been reviewed');
        expect((await db.getCollection<any>('notifications')).some(n=>n.recipientId==='i')).toBe(true);
    });
    it('keeps rejected curriculum out of the published course and requires platform course approval',async()=>{
        const workflow=module.get(CourseWorkflowService);
        const teacher={id:'role-0',profileId:'i',organizationId:'o',aliases:['i'],canonicalRole:'instructor',name:'Teacher'};
        const org={id:'role-1',profileId:'o',aliases:['o'],canonicalRole:'organization',name:'School'};
        const proposal=[{title:'Proposal',items:[]}];const before=(await service.course('c')).modules;
        const request=await workflow.request('c',{modules:proposal},teacher);
        await expect(workflow.decide(request.id,{decision:'reject'},org)).rejects.toThrow('Explain why');
        await workflow.decide(request.id,{decision:'reject',note:'Add lesson material'},org);
        expect((await service.course('c')).modules).toEqual(before);
        const courses=await db.getCollection<any>('courses');Object.assign(courses.find(c=>c.id==='draft'),{organizationId:'o',instructorId:'i'});await db.setCollection('courses',courses);
        await workflow.submit('draft',org);expect((await service.course('draft')).status).toBe('Pending Approval');
        expect((await db.getCollection<any>('notifications')).some(n=>n.recipientRole==='platform'&&n.courseId==='draft')).toBe(true);
        await service.review('draft',{decision:'approve'},admin);expect((await service.course('draft')).status).toBe('Published');
        expect((await db.getCollection<any>('notifications')).some(n=>n.recipientId==='o'&&n.courseId==='draft')).toBe(true);
    });

    it.each(['/users','/organizations','/learners','/admin/accounts','/notifications','/workspace/notifications','/payments/transactions'])('blocks manual administration creation through legacy route %s',async path=>{
        const repo=(name:string)=>new JsonRepository(name,db);
        const guard=new AccountAccessGuard(repo('users'),repo('learners'),repo('instructors'),repo('organizations'));
        const context={switchToHttp:()=>({getRequest:()=>({method:'POST',path:'/api'+path,headers:{'x-user-id':'a'},body:{}})})} as any;
        await expect(guard.canActivate(context)).rejects.toThrow();
    });
    it('does not trust a supplied role to edit organization identities or delete instructors',async()=>{
        const repo=(name:string)=>new JsonRepository(name,db);
        const guard=new AccountAccessGuard(repo('users'),repo('learners'),repo('instructors'),repo('organizations'));
        const context=(path:string,method:string,body:any={})=>({switchToHttp:()=>({getRequest:()=>({method,path:'/api'+path,headers:{'x-user-id':'a','x-role':'organization'},body})})}) as any;
        await expect(guard.canActivate(context('/organizations/o','PATCH',{email:'wrong@test.com'}))).rejects.toThrow('cannot edit');
        await expect(guard.canActivate(context('/users/role-1','PATCH',{email:'wrong@test.com'}))).rejects.toThrow('owner');
        await expect(guard.canActivate(context('/instructors/i','DELETE'))).rejects.toThrow('cannot be deleted');
        await expect(guard.canActivate(context('/instructors','POST'))).rejects.toThrow('Only an organization');
        await expect(guard.canActivate(context('/admin/payments/t1','PATCH',{currency:'USD'}))).rejects.toThrow('read-only');
    });

    it('blocks pending organization sessions and requires explicit administrator verification',async()=>{
        const auth=module.get(AuthService);const registered=await auth.register({name:'Pending Institute',email:'pending@institute.test',password:'Password123!',role:'Organization'});
        expect(registered.token).toBeNull();
        await expect(module.get(WorkspaceService).identity({'x-user-id':registered.user.id})).rejects.toThrow('verification');
        await expect(service.editAccount(registered.user.id,{status:'Active'},admin)).rejects.toThrow('verification');
        await expect(service.verifyOrganization(registered.user.id,{decision:'approve'},{id:'u',role:'Student'})).rejects.toThrow('Administrator');
        await expect(service.verifyOrganization(registered.user.id,{decision:'reject'},admin)).rejects.toThrow('reason');
        await service.verifyOrganization(registered.user.id,{decision:'approve'},admin);
        expect((await auth.login({email:'pending@institute.test',password:'Password123!'})).user.role).toBe('Organization');
        expect((await db.getCollection<any>('organizations')).find(o=>o.id===registered.user.organizationId).verificationStatus).toBe('Verified');
        await expect(service.verifyOrganization(registered.user.id,{decision:'approve'},admin)).rejects.toThrow('not awaiting');
    });
    it('rejects admin course edits and lifecycle changes while keeping course review available',async()=>{
        await expect(service.editCourse('c',{title:'Wrong edit'})).rejects.toThrow('Administrators approve');
        await expect(service.archiveCourse('c')).rejects.toThrow('owning organization');
        await expect(service.removeCourse('c')).rejects.toThrow('owning organization');
        expect((await service.review('c',{decision:'approve'},admin)).status).toBe('Published');
    });
    it('creates the organization profile through self-registration and blocks public administrator signup',async()=>{
        const auth=module.get(AuthService);
        await expect(auth.register({name:'Unapproved Admin',email:'new-admin@test.com',password:'Password123!',role:'Admin'})).rejects.toThrow('cannot be created');
        const result=await auth.register({name:'Registered Institute',email:'new-org@test.com',password:'Password123!',role:'Organization'});
        expect(result.user.organizationId).toBeTruthy();
        expect(result.pendingVerification).toBe(true);
        await expect(auth.login({email:'new-org@test.com',password:'Password123!'})).rejects.toThrow('verification');
        await service.verifyOrganization(result.user.id,{decision:'approve'},admin);
        const identity=await module.get(WorkspaceService).identity({'x-user-id':result.user.id});
        expect(identity.profileId).toBe(result.user.organizationId);
        const directory=await service.accounts('Organization',admin);
        expect(directory.items.some(u=>u.id===result.user.id)).toBe(true);
    });

});
