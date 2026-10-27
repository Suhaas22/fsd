import {courseDuration} from '../../common/learning/duration';
import { paymentRecords } from '../../common/payments/payment-records';
import { AuthService } from '../auth/auth.service';
import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JsonDatabaseService } from '../../database/json-db.service';
import { JsonRepository } from '../../database/json-repository';
import { UsersService } from '../users/users.service';
import { AdminProfile, AdminQuery, CourseDecision } from './platform.dto';
const number = (v: any): number | null => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null;
const paid = (s: any) => ['completed', 'paid', 'success', 'successful'].includes(String(s).toLowerCase());
const currency = (r: any): string | null => /^[A-Z]{3}$/.test(String(r.currency || '').toUpperCase()) ? String(r.currency).toUpperCase() : null;
const time = (r: any) => Date.parse(r.createdAt || r.date || '') || 0;
const array = (v: any): any[] => Array.isArray(v) ? v : [];
@Injectable()
export class PlatformService {
    constructor(private readonly db: JsonDatabaseService, private readonly users: UsersService, private readonly auth: AuthService) { }
    private records(name: string) { return this.db.getCollection<any>(name); }
    async account(headers: any) {
        const token = String(headers.authorization || '').replace(/^Bearer\s+/i, '');
        const id = headers['x-user-id'] || token.match(/^jwt-token-(.+)-\d+$/)?.[1];
        const user = (await this.records('users')).find(u => u.id === id);
        if (!user)
            throw new UnauthorizedException('Sign in with an admin account.');
        if (!['admin', 'superadmin'].includes(String(user.role).toLowerCase().replace(/[\s_-]/g, '')))
            throw new ForbiddenException('Admin access is required.');
        if (user.status === 'Suspended')
            throw new ForbiddenException('This account is suspended.');
        return { id: user.id, name: user.name, email: user.email, role: user.role, lastLogin: user.lastLogin || null };
    }
    async session(account: any) {
        const notifications = await this.records('notifications');
        return { profile: account, unreadNotifications: notifications.filter(n => !n.read && (n.recipientId ? n.recipientId === account.id : !n.recipientRole || ['admin', 'all'].includes(String(n.recipientRole).toLowerCase()))).length };
    }
    async updateProfile(account: any, dto: AdminProfile) {
        const changes: any = {};
        if (dto.name !== undefined) {
            if (!dto.name.trim())
                throw new BadRequestException('Name is required.');
            changes.name = dto.name.trim();
        }
        if (dto.email !== undefined) {
            changes.email = dto.email.trim().toLowerCase();
            if ((await this.records('users')).some(u => u.id !== account.id && String(u.email).toLowerCase() === changes.email))
                throw new ConflictException('This email is already in use.');
        }
        await new JsonRepository<any>('users', this.db).update(account.id, changes);
        return this.account({ 'x-user-id': account.id });
    }
    private async courseRecords() {
        const [courses, orgs, teachers, enrollments, reviews] = await Promise.all(['courses', 'organizations', 'instructors', 'enrollments', 'reviews'].map(n => this.records(n)));
        return courses.filter(c=>!['Archived','Rejected','Deleted'].includes(c.status)).map(c => {
            const ids = new Set([c.instructorId, ...array(c.coInstructorIds), ...array(c.instructors).filter(Boolean).map(i => typeof i === 'string' ? i : i.id)].filter(Boolean));
            const faculty = teachers.filter(i => i.organizationId===c.organizationId&&ids.has(i.id)).map(i => ({ id: i.id, name: i.name, email: i.email }));
            const ratings = reviews.filter(r => r.courseId === c.id && number(r.rating) !== null && r.rating >= 1 && r.rating <= 5);
            const modules = array(c.modules).filter(m=>m&&typeof m==='object').map(m => ({ ...m, lessonCount: Array.isArray(m.items) ? m.items.length : Array.isArray(m.lessons) ? m.lessons.length : number(m.lessons) ?? 0 }));
            const own = enrollments.filter(e => e.courseId === c.id);
            return { ...c, organizationName: orgs.find(o => o.id === c.organizationId)?.name || c.organizationName || null,
                ...courseDuration(c), instructors: faculty, enrolledCount: own.length, completedCount: own.filter(e => e.status === 'Completed' || Number(e.progress) === 100).length,
                rating: ratings.length ? ratings.reduce((s, r) => s + Number(r.rating), 0) / ratings.length : null, reviewCount: ratings.length,
                modules, modulesCount: modules.length, lessonsCount: modules.reduce((s, m) => s + m.lessonCount, 0), price: number(c.price), currency: currency(c) };
        });
    }
    private paginate(rows: any[], q: AdminQuery) {
        const limit = Math.min(1000, Math.max(1, Number(q.limit) || 12));
        const page = Math.max(1, Number(q.page) || 1);
        return { items: rows.slice((page - 1) * limit, page * limit), total: rows.length, page, totalPages: Math.max(1, Math.ceil(rows.length / limit)) };
    }
    async courses(q: AdminQuery) {
        const all = await this.courseRecords();
        const term = String(q.search || '').toLowerCase().trim();
        const rows = all.filter(c => (!q.status || c.status === q.status) && (!term || [c.id, c.title, c.category, c.organizationName, ...c.instructors.map(i => i.name)].some(v => String(v || '').toLowerCase().includes(term))));
        return { ...this.paginate(rows.sort((a, b) => time(b) - time(a)), q), statuses: [...new Set(all.map(c => c.status).filter(Boolean))].sort() };
    }
    async courseQueue(search='') {
        const all=await this.courseRecords();const term=String(search).trim().toLowerCase();
        const matches=(c:any)=>!term||[c.title,c.organizationName,...c.instructors.map(i=>i.name)].some(v=>String(v||'').toLowerCase().includes(term));
        const pending=all.filter(c=>c.status==='Pending Approval').sort((a,b)=>time(b)-time(a));
        const recent=all.filter(c=>c.status==='Published').sort((a,b)=>(Date.parse(b.reviewedAt||b.publishedAt||b.updatedAt||b.createdAt)||0)-(Date.parse(a.reviewedAt||a.publishedAt||a.updatedAt||a.createdAt)||0)).slice(0,10);
        return {pending:pending.filter(matches),recentlyApproved:recent.filter(matches),pendingCount:pending.length,recentlyApprovedCount:recent.length};
    }
    async demoCredentials(role?: string){
        const single = Boolean(role);
        if(process.env.NODE_ENV==='production'&&process.env.ENABLE_DEMO_LOGIN!=='true')return single?null:[];
        const [demos, users] = await Promise.all([this.records('demo_accounts'),this.records('users')]);
        const available=demos.filter(d=>!single||d.role===role).flatMap(demo=>{
            const account=users.find(a=>a.id===demo.userId&&a.status==='Active'&&a.role===demo.role&&a.password===demo.password);
            return account?[{role:demo.role,name:account.name,email:account.email,password:demo.password}]:[];
        });
        return single?available[0]||null:available;
    }
    async course(id: string) { const course = (await this.courseRecords()).find(c => c.id === id); if (!course)
        throw new NotFoundException('Course not found.'); return course; }
    async review(id: string, dto: CourseDecision, admin: any) {
        if (!['approve', 'reject'].includes(dto.decision))
            throw new BadRequestException('Choose approve or reject.');
        if (dto.decision === 'reject' && !dto.reason?.trim())
            throw new BadRequestException('A rejection reason is required.');
        return this.db.runTransaction(async () => {
            const c = await this.course(id);
            if (c.status !== 'Pending Approval')
                throw new ConflictException('Only submitted courses awaiting approval can be reviewed.');
            if (dto.decision === 'approve' && !c.instructors.length)
                throw new BadRequestException('Assign an existing instructor before publishing.');
            const reviewedAt = new Date().toISOString();
            const rejected=dto.decision==='reject';
            const hasHistory=rejected&&((await this.records('enrollments')).some(e=>e.courseId===id)||(await this.records('transactions')).some(t=>t.courseId===id));
            if(rejected){
              await new JsonRepository<any>('course_decisions',this.db).create({courseId:id,courseTitle:c.title,organizationId:c.organizationId,decision:'Rejected',reason:dto.reason.trim(),reviewedBy:admin.id,createdAt:reviewedAt,deleted:!hasHistory});
              if(!hasHistory){await new JsonRepository<any>('courses',this.db).delete(id);for(const name of ['curriculum_drafts','module_requests'])await new JsonRepository<any>(name,this.db).deleteMany({courseId:id});}
              else await new JsonRepository<any>('courses',this.db).update(id,{status:'Deleted',reviewNote:dto.reason.trim(),reviewedBy:admin.id,reviewedAt});
            }else await new JsonRepository<any>('courses',this.db).update(id,{status:'Published',reviewNote:null,reviewedBy:admin.id,reviewedAt});

            await new JsonRepository<any>('admin_activity', this.db).create({ adminId: admin.id, adminName: admin.name, courseId: id, organizationId:c.organizationId,title: `${rejected?'Rejected course deleted':'Course approved'}: ${c.title}`, actionTaken: dto.reason?.trim() || 'Approved for publication', resolvedAt: reviewedAt });
            if(c.organizationId)await new JsonRepository<any>('notifications',this.db).create({title:dto.decision==='approve'?'Course approved':'Rejected course deleted',desc:`${c.title}: ${dto.decision==='approve'?'approved for publication':dto.reason.trim()}`,category:'CourseApproval',recipientId:c.organizationId,courseId:id,actionUrl:rejected?'/org/logs':`/org/courses/${id}`,actionLabel:'View course',read:false,createdAt:reviewedAt});
            const notices=await this.records('notifications');
            for(const notice of notices.filter(n=>n.category==='CourseApproval'&&n.courseId===id&&n.recipientRole==='platform')){notice.read=true;notice.actionLabel='Review completed';}
            await this.db.setCollection('notifications',notices);
            return rejected?{id,courseId:id,title:c.title,organizationId:c.organizationId,status:'Deleted',deleted:true,reviewNote:dto.reason.trim()}:this.course(id);
        });
    }
    private paymentRecords(){return paymentRecords(this.db);}
    private filterPayments(rows: any[], q: AdminQuery) { const term = String(q.search || '').trim().toLowerCase(); return rows.filter(t => (!q.status || t.status === q.status) && (!q.type || t.type === q.type) && (!term || [t.id, t.payer, t.course, t.method].some(v => String(v || '').toLowerCase().includes(term)))); }
    private totals(rows: any[]) {
        const groups = new Map<string, {
            currency: string | null;
            amount: number;
        }>();
        rows.filter(t => t.type === 'Payment' && paid(t.status) && t.amount !== null).forEach(t => { const key = t.currency || 'unknown'; const g = groups.get(key) || { currency: t.currency, amount: 0 }; g.amount = Math.round((g.amount + t.amount) * 100) / 100; groups.set(key, g); });
        return [...groups.values()];
    }
    async payments(q: AdminQuery) { const all = await this.paymentRecords(); return { ...this.paginate(this.filterPayments(all, q), q), statuses: [...new Set(all.map(t => t.status).filter(Boolean))], types: [...new Set(all.map(t => t.type).filter(Boolean))], summary: { totals: this.totals(all), completedPayments: all.filter(t => t.type === 'Payment' && paid(t.status)).length, pendingPayments: all.filter(t => t.type === 'Payment' && String(t.status).toLowerCase() === 'pending').length, failedPayments: all.filter(t => t.type === 'Payment' && String(t.status).toLowerCase() === 'failed').length } }; }
    async exportPayments(q: AdminQuery) {
        const rows = this.filterPayments(await this.paymentRecords(), q);
        const cell = (v: any) => { let s = String(v ?? ''); if (/^\s*[=+@-]/.test(s))
            s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
        return { filename: `transactions-${new Date().toISOString().slice(0, 10)}.csv`, content: [['ID', 'Type', 'Payer', 'Course', 'Amount', 'Currency', 'Method', 'Date', 'Status'], ...rows.map(t => [t.id, t.type, t.payer, t.course, t.amount, t.currency, t.method, t.date || t.createdAt, t.status])].map(r => r.map(cell).join(',')).join('\r\n') };
    }
    async editCourse(id:string,dto:any){throw new ForbiddenException('Course content can only be edited by its organization or assigned instructors. Administrators approve or reject submissions.');}
    async removeCourse(id:string){throw new ForbiddenException('Only the owning organization manages the course lifecycle.');}
    async archiveCourse(id:string){throw new ForbiddenException('Only the owning organization can archive a course.');}
    async finance() {
      const [rows,orgs,courses,learners,settings,enrollments]=await Promise.all([this.paymentRecords(),this.records('organizations'),this.records('courses'),this.records('learners'),this.records('settings'),this.records('enrollments')]);
      const commission=Number(settings[0]?.platformCommissionRate);
      const rate=Number.isFinite(commission)&&commission>=0&&commission<=1?commission:null;
      const organizationRows=orgs.flatMap(org=>{
        const related=rows.filter(t=>t.organizationId===org.id||courses.find(c=>c.id===t.courseId)?.organizationId===org.id);
        const currencies=[...new Set(related.map(t=>t.currency))];
        return currencies.map(code=>{
          const payments=related.filter(t=>t.currency===code&&t.type==='Payment'&&paid(t.status));
          const gross=payments.reduce((sum,t)=>sum+(t.amount||0),0);
          const payouts=rows.filter(t=>t.organizationId===org.id&&t.currency===code&&t.type==='Payout'&&paid(t.status));
          const paidAmount=payouts.reduce((sum,t)=>sum+(t.amount||0),0);
          const share=rate===null?null:Math.round(gross*(1-rate)*100)/100;
          return {organizationId:org.id,name:org.name,currency:code,received:gross,platformShare:rate===null?null:Math.round((gross-share)*100)/100,organizationShare:share,paid:paidAmount,due:share===null?null:Math.max(0,Math.round((share-paidAmount)*100)/100),learners:new Set(payments.map(t=>t.payerId||t.learnerId||t.payer).filter(Boolean)).size,payments:payments.length};
        });
      });
      const totals=this.totals(rows);
      const currencySummaries=totals.map(t=>{const orgGroups=organizationRows.filter(o=>o.currency===t.currency);return {currency:t.currency,gross:t.amount,platformMargin:rate===null?null:Math.round(orgGroups.reduce((sum,o)=>sum+(o.platformShare||0),0)*100)/100,organizationShare:rate===null?null:Math.round(orgGroups.reduce((sum,o)=>sum+(o.organizationShare||0),0)*100)/100,paid:orgGroups.reduce((sum,o)=>sum+o.paid,0),due:rate===null?null:Math.round(orgGroups.reduce((sum,o)=>sum+(o.due||0),0)*100)/100,unallocated:Math.round((t.amount-orgGroups.reduce((sum,o)=>sum+o.received,0))*100)/100};});
      return {totals,currencySummaries,organizations:organizationRows,platformCommissionRate:rate,learnerCount:new Set(rows.filter(t=>t.type==='Payment'&&paid(t.status)).map(t=>t.payerId||t.learnerId||t.payer).filter(Boolean)).size,enrollmentCount:enrollments.length};
    }
    async payout(body:any,admin:any) {
      if(!String(body.reference||'').trim()||!String(body.method||'').trim())throw new BadRequestException('Payment reference and method are required.');
      const amount=number(body.amount);if(amount===null||amount<=0)throw new BadRequestException('Enter a positive payout amount.');
      return this.db.runTransaction(async()=>{
        const summary=await this.finance();
        const group=summary.organizations.find(o=>o.organizationId===body.organizationId&&o.currency===(body.currency||null));
        if(!group||group.due===null)throw new BadRequestException('This organization has no calculated payable balance.');
        if(!group.currency)throw new BadRequestException('Record the source payment currency before recording a payout.');
        if(amount>group.due)throw new BadRequestException('Payout exceeds the remaining organization balance.');
        const rows=await this.records('transactions');if(rows.some(t=>t.type==='Payout'&&t.reference===body.reference.trim()))throw new ConflictException('That payout reference is already recorded.');
        const now=new Date().toISOString();return new JsonRepository<any>('transactions',this.db).create({type:'Payout',organizationId:group.organizationId,organizationName:group.name,payer:'Platform',payee:group.name,amount,currency:group.currency,method:body.method.trim(),reference:body.reference.trim(),status:'Completed',createdAt:now,date:now,recordedBy:admin.id});
      });
    }
    async accounts(role:string,admin:any) {
      const superAdmin=String(admin.role).toLowerCase()==='superadmin';
      const allowed=superAdmin?['Learner','Organization','Admin']:['Learner','Organization'];
      if(role&&!allowed.includes(role))throw new ForbiddenException('This account type is not managed here.');
      const all=(await this.users.findAll()).filter(u=>allowed.includes(u.role));
      return {items:role?all.filter(u=>u.role===role):all,counts:Object.fromEntries(allowed.map(r=>[r,all.filter(u=>u.role===r).length]))};
    }
    async accountDetail(id:string,admin:any) {
      const user=await this.users.findOne(id);
      const allowed=String(admin.role).toLowerCase()==='superadmin'?['Learner','Organization','Admin']:['Learner','Organization'];
      if(!allowed.includes(user.role))throw new ForbiddenException('This account type is not managed here.');
      if(String(admin.role).toLowerCase()==='superadmin'){
        if(user.role==='Organization'){
          const finance=await this.finance();
          const orgs=await this.records('organizations');
          const org=orgs.find(o=>o.userId===user.id||o.id===user.organizationId||o.email?.toLowerCase()===user.email?.toLowerCase());
          return {...user,settlements:finance.organizations.filter(o=>o.organizationId===org?.id)};
        }
        if(user.role==='Admin')return {...user,history:await this.history(admin,user.id)};
      }
      return user;
    }
    async history(admin:any,adminId?:string){
      if(String(admin.role).toLowerCase()!=='superadmin')throw new ForbiddenException('Only the super administrator can review administrator activity.');
      const [activity,disputes,users]=await Promise.all([this.records('admin_activity'),this.records('disputes'),this.records('users')]);
      const administrators=users.filter(u=>u.role==='Admin');
      const names=new Map(administrators.map(u=>[u.id,u.name]));
      const actions=activity.filter(a=>!adminId||a.adminId===adminId).map(a=>({...a,adminName:names.get(a.adminId)||a.adminName||'Administrator',date:a.createdAt||a.resolvedAt,action:a.title||'Administration action',details:a.actionTaken||''}));
      const cases=disputes.filter(d=>!adminId||d.assignedTo===adminId||d.resolvedBy===names.get(adminId)||Array.isArray(d.timeline)&&d.timeline.some(t=>t.actorId===adminId)).map(d=>({id:d.id,subject:d.subject,status:d.status,assignedName:names.get(d.assignedTo)||d.assignedName||d.resolvedBy||null,resolution:d.resolutionNote||d.rejectionReason||null,updatedAt:d.resolvedAt||d.updatedAt||d.createdAt}));
      return {administrators:administrators.map(u=>({id:u.id,name:u.name})),actions:actions.sort((a,b)=>(Date.parse(b.date)||0)-(Date.parse(a.date)||0)),cases};
    }
    async verifyOrganization(id:string,body:any,admin:any){
      if(!['admin','superadmin'].includes(String(admin.role).toLowerCase().replace(/\s/g,'')))throw new ForbiddenException('Administrator verification is required.');
      if(!['approve','reject'].includes(body.decision))throw new BadRequestException('Choose approve or reject.');
      if(body.decision==='reject'&&!String(body.reason||'').trim())throw new BadRequestException('Provide a rejection reason.');
      return this.db.runTransaction(async()=>{
        const account=(await this.records('users')).find(u=>u.id===id);
        if(!account||account.role!=='Organization')throw new NotFoundException('Organization account not found.');
        if(account.status!=='Pending Verification')throw new ConflictException('This organization is not awaiting verification.');
        const org=(await this.records('organizations')).find(o=>o.userId===account.id||o.id===account.organizationId);
        if(!org)throw new NotFoundException('Organization profile not found.');
        const now=new Date().toISOString();const changes={status:body.decision==='approve'?'Active':'Rejected',verificationStatus:body.decision==='approve'?'Verified':'Rejected',verifiedBy:admin.id,verifiedAt:now,verificationNote:String(body.reason||'').trim()};
        await new JsonRepository<any>('users',this.db).update(account.id,changes);
        await new JsonRepository<any>('organizations',this.db).update(org.id,changes);
        await new JsonRepository<any>('notifications',this.db).create({title:body.decision==='approve'?'Organization verified':'Organization verification rejected',desc:body.decision==='approve'?'Your organization account is approved. You can now sign in.':changes.verificationNote,recipientId:account.id,recipientRole:'organization',read:false,createdAt:now});
        await new JsonRepository<any>('admin_activity',this.db).create({adminId:admin.id,adminName:admin.name,title:`Organization ${body.decision==='approve'?'verified':'rejected'}: ${account.name}`,actionTaken:changes.verificationNote||changes.verificationStatus,createdAt:now});
        return this.accountDetail(id,admin);
      });
    }
    async editAccount(id:string,body:any,admin:any) {
      const account=await this.accountDetail(id,admin);
      if(account.role==='Organization'&&['Pending Verification','Rejected'].includes(account.status))throw new ForbiddenException('Use organization verification before changing account access.');
      if(Object.keys(body).some(key=>key!=='status'))throw new ForbiddenException('Account details belong to the account owner. Platform administrators can only change access.');
      if(!['Active','Suspended'].includes(body.status))throw new BadRequestException('Choose Active or Suspended.');
      if(id===admin.id)throw new BadRequestException('You cannot suspend your own account.');
      const data:any={status:body.status};
      const updated=await this.users.update(id,data,String(admin.role).toLowerCase());
      await new JsonRepository<any>('admin_activity',this.db).create({adminId:admin.id,adminName:admin.name,title:`Account updated: ${updated.name}`,actionTaken:data.status?`Access changed to ${data.status}`:'Account details edited',createdAt:new Date().toISOString()});
      return updated;
    }
    async deleteAccount(id:string,admin:any){if(id===admin.id)throw new BadRequestException('You cannot delete your own account.');const account=await this.accountDetail(id,admin);const result=await this.users.remove(id,String(admin.role).toLowerCase());await new JsonRepository<any>('admin_activity',this.db).create({adminId:admin.id,adminName:admin.name,title:`Account deleted: ${account.name}`,actionTaken:'Login removed; history preserved',createdAt:new Date().toISOString()});return result;}
    async createAccount(body:any,admin:any){
      throw new ForbiddenException('Platform administrators cannot create accounts. Learners and organizations register themselves; instructors are managed by organizations.');
    }
    async editTransaction(id:string,body:any,admin:any){
      throw new ForbiddenException('Payment records are read-only and cannot be edited.');
    }
    async executive(admin:any){
      if(String(admin.role).toLowerCase()!=='superadmin')throw new ForbiddenException('Super administrator access is required.');
      const [finance,overview,activity,disputes,users]=await Promise.all([this.finance(),this.overview(),this.records('admin_activity'),this.records('disputes'),this.records('users')]);
      const operations=[...activity.map(a=>({id:a.id,title:a.title||'Administration action',detail:a.actionTaken||'',date:a.createdAt||a.resolvedAt})),...disputes.flatMap(d=>array(d.timeline).map(t=>({id:d.id+'-'+t.id,title:d.subject||d.id,detail:t.message||t.event||'',date:t.timestamp||t.createdAt})))].sort((a,b)=>(Date.parse(b.date)||0)-(Date.parse(a.date)||0)).slice(0,12);
      return {finance,stats:{...overview.stats,admins:users.filter(u=>u.role==='Admin').length,openDisputes:disputes.filter(d=>!['Resolved','Rejected'].includes(d.status)).length},operations};
    }
    async transitionDispute(id:string,body:any,admin:any){
      const status=String(body.status||'');const note=String(body.note||'').trim();
      if(!['In Progress','Resolved','Rejected','Open'].includes(status))throw new BadRequestException('Choose a valid case status.');
      if(!note)throw new BadRequestException('Add a case note explaining this update.');
      return this.db.runTransaction(async()=>{
        const repo=new JsonRepository<any>('disputes',this.db);const d=await repo.findById(id);if(!d)throw new NotFoundException('Dispute not found.');
        if(status===d.status)throw new ConflictException('The case already has this status.');
        const closed=['Resolved','Rejected'].includes(d.status);
        if(closed&&status!=='Open')throw new ConflictException('Reopen this case before making another decision.');
        const now=new Date().toISOString();const resolved=['Resolved','Rejected'].includes(status);
        const entry={id:'event-'+Date.now(),type:status==='Resolved'?'resolved':status==='Rejected'?'rejected':'status',message:`${admin.name}: ${d.status} → ${status}. ${note}`,timestamp:now,actorId:admin.id};
        const updated=await repo.update(id,{status,assignedTo:admin.id,assignedName:admin.name,...(status==='Resolved'?{resolutionNote:note}:{}),...(status==='Rejected'?{rejectionReason:note}:{}),resolvedBy:resolved?admin.name:null,resolvedAt:resolved?now:null,timeline:[...array(d.timeline),entry]});
        await new JsonRepository<any>('admin_activity',this.db).create({adminId:admin.id,adminName:admin.name,title:`Dispute ${id}: ${status}`,actionTaken:note,disputeId:id,resolvedAt:now});
        const target=d.raisedById||d.userId||d.learnerId||d.organizationId;
        if(target)await new JsonRepository<any>('notifications',this.db).create({title:`Case updated: ${d.subject||id}`,desc:`Status: ${status}. ${note}`,category:'Dispute',recipientId:target,read:false,createdAt:now});
        return updated;
      });
    }
    async overview() {
        const [users, courses, learners, orgs, teachers, enrollments, payments] = await Promise.all([this.users.findAll(), this.courseRecords(), this.records('learners'), this.records('organizations'), this.records('instructors'), this.records('enrollments'), this.paymentRecords()]);
        const now = new Date();
        const pending = courses.filter(c => c.status === 'Pending Approval');
        return { stats: { learners: learners.length, activeLearners: learners.filter(l => l.status === 'Active').length, organizations: orgs.length, instructors: teachers.length, courses: courses.length, publishedCourses: courses.filter(c => c.status === 'Published').length, enrollments: enrollments.length, pendingApprovals: pending.length }, paymentTotals: this.totals(payments), pendingCourses: pending.slice(0, 5), recentUsers: users.filter(u => ['Learner', 'Organization'].includes(u.role)).sort((a, b) => time(b) - time(a)).slice(0, 5), learnerTrend: Array.from({ length: 6 }, (_, i) => { const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + i, 1)); const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)); return { name: start.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }), learners: learners.filter(l => time(l) >= +start && time(l) < +end).length }; }) };
    }
    async landing() {
        const [courses, learners, teachers, enrollments, certificates, reviews] = await Promise.all([this.courseRecords(), this.records('learners'), this.records('instructors'), this.records('enrollments'), this.records('certificates'), this.records('reviews')]);
        const published = courses.filter(c => c.status === 'Published');
        const ids = new Set(published.map(c => c.id));
        return { stats: { learners: learners.length, courses: published.length, instructors: teachers.length, completions: enrollments.filter(e => e.status === 'Completed' || Number(e.progress) === 100).length, certificates: certificates.length }, courses: published.sort((a, b) => b.enrolledCount - a.enrolledCount).map(c => ({ id: c.id, title: c.title, category: c.category || null, level: c.level || null, organization: c.organizationName, instructor: c.instructors[0]?.name || null, rating: c.rating, reviews: c.reviewCount, enrollments: c.enrolledCount, thumbnail: /^https?:\/\//.test(c.thumbnail || '') || String(c.thumbnail || '').startsWith('/uploads/') ? c.thumbnail : null })), reviews: reviews.filter(r => ids.has(r.courseId) && number(r.rating) !== null && r.rating >= 1 && r.rating <= 5 && String(r.comment || '').trim()).slice(0, 3).map(r => ({ id: r.id, comment: r.comment, rating: Number(r.rating), course: published.find(c => c.id === r.courseId)?.title })) };
    }
}
