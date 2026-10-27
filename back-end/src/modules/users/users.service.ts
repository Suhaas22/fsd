import {assignedInstructorIds} from '../../common/courses/assignment';
import { enrollmentLearning } from '../../common/learning/learning-records';
import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { JsonDatabaseService } from '../../database/json-db.service';
import { UserEntity } from '../../database/schema';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepo: JsonRepository<UserEntity>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATIONS) private readonly orgsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES) private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS) private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS) private readonly transactionsRepo: JsonRepository<any>,
    private readonly db: JsonDatabaseService,
  ) {}

  private publicUser(user: any) {
    const { password, passwordHash, ...record } = user;
    return { ...record, role: ['Student', 'Learner'].includes(record.role) ? 'Learner' : record.role };
  }

  async getActivity() { return new JsonRepository<any>('admin_activity', this.db).find(); }

  async recordActivity(data: any) {
    return new JsonRepository<any>('admin_activity', this.db).create({ ...data, resolvedAt: new Date().toISOString() });
  }

  async findAll(role?: string) {
    const [accounts, learners, orgs] = await Promise.all([
      this.usersRepo.find(), this.learnersRepo.find(), this.orgsRepo.find(),
    ]);
    const records = accounts.map(account => this.publicUser(account));
    for (const [profiles, kind] of [[learners, 'Learner'], [orgs, 'Organization']] as const) {
      for (const profile of profiles) {
        const linked = records.find(account => account.id === profile.userId ||
          (kind === 'Organization' && account.organizationId === profile.id) ||
          (!!profile.email && account.email?.toLowerCase() === profile.email.toLowerCase()));
        if (!linked) records.push(this.publicUser({ ...profile, role: kind }));
      }
    }
    if (!role) return records;
    const lower = role.toLowerCase() === 'student' ? 'learner' : role.toLowerCase();
    return records.filter(user => user.role?.toLowerCase() === lower);
  }

  async findOne(id: string) {
    const [users, learners, instructors, orgs, courses, enrollments, transactions] = await Promise.all([
      this.usersRepo.find(), this.learnersRepo.find(), this.instructorsRepo.find(), this.orgsRepo.find(),
      this.coursesRepo.find(), this.enrollmentsRepo.find(), this.transactionsRepo.find(),
    ]);
    let account: any = users.find(u => u.id === id);
    if (!account) {
      const learner = learners.find(l => l.id === id);
      const instructor = instructors.find(i => i.id === id);
      const org = orgs.find(o => o.id === id);
      const profile = learner || instructor || org;
      if (!profile) throw new NotFoundException(`User '${id}' not found`);
      account = { ...profile, role: learner ? 'Learner' : instructor ? 'Instructor' : 'Organization' };
    }
    const matches = (record: any) => record.id === account.id || record.userId === account.id ||
      (!!record.email && record.email.toLowerCase() === account.email?.toLowerCase());
    const learner = learners.find(matches);
    const instructor = instructors.find(matches);
    const org = orgs.find(matches) || orgs.find(o => o.id === account.organizationId);
    const role = this.publicUser(account).role;
    const profile = role === 'Learner' ? learner : role === 'Instructor' ? instructor : role === 'Organization' ? org : null;
    const linkedIds = [account.id, profile?.id].filter(Boolean);
    const faculty = role === 'Organization' && org ? instructors.filter(i => i.organizationId === org.id) : [];
    const relatedCourses = courses.filter(c => !['Archived','Rejected','Deleted'].includes(c.status) && (role === 'Instructor'
      ? c.organizationId === instructor?.organizationId && assignedInstructorIds(c).some(id=>linkedIds.includes(id))
      : role === 'Organization' && !!org && c.organizationId === org.id));
    const ownEnrollments = role === 'Learner' ? enrollments.filter(e => linkedIds.includes(e.learnerId) || linkedIds.includes(e.userId) ||
      (!!e.learnerEmail && e.learnerEmail.toLowerCase() === account.email?.toLowerCase())) : [];
    const orgCourseIds = new Set(relatedCourses.map(c => c.id));
    const enrolledIds = new Set(enrollments.filter(e => orgCourseIds.has(e.courseId)).map(e => e.learnerId));
    const orgLearners = role === 'Organization' && org ? learners.filter(l => l.organizationId === org?.id || enrolledIds.has(l.id)) : [];
    const ownTransactions = transactions.filter(t => role === 'Organization' ? !!org && (t.organizationId === org.id || orgCourseIds.has(t.courseId)) :
      linkedIds.includes(t.learnerId) || linkedIds.includes(t.payerId) || linkedIds.includes(t.userId) ||
      (!!t.payerEmail && t.payerEmail.toLowerCase() === account.email?.toLowerCase()));
    return { ...this.publicUser({ ...account, ...profile, id: account.id, status: account.status ?? profile?.status, role }),
      enrollments: ownEnrollments.map(e => {
        const course = courses.find(c => c.id === e.courseId);
        return { ...enrollmentLearning(course,e), course: course?.title || e.courseTitle || e.course,
          organization: orgs.find(o => o.id === (course?.organizationId || e.organizationId))?.name || '',
          instructor: instructors.find(i => i.id === (course?.instructorId || e.instructorId))?.name || '' };
      }),
      courses: relatedCourses.map(c => ({ ...c, students: enrollments.filter(e => e.courseId === c.id).length, createdDate: c.createdAt?.slice(0, 10) })),
      transactions: ownTransactions,
      orgInstructors: faculty.map(i => ({ ...i, expertise: i.specialization || i.department, courses: relatedCourses.filter(c => assignedInstructorIds(c).includes(i.id)).length })),
      orgLearners, coursesCount: relatedCourses.length, instructorsCount: faculty.length, learnersCount: orgLearners.length,
    };
  }

  async create(dto: CreateUserDto) {
    const newUser = await this.usersRepo.create({
      id: `usr-${Date.now()}`,
      name: dto.name,
      email: dto.email,
      role: (dto.role as any) || 'Student',
      status: (dto.status as any) || 'Active',
      verificationStatus: (dto.verificationStatus as any) || 'Verified',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    });
    return this.publicUser(newUser);
  }

  private async accountRecords(id: string) {
    const detail = await this.findOne(id);
    const accounts = await this.usersRepo.find();
    const account = accounts.find(user => user.id === id ||
      (!!detail.email && user.email?.toLowerCase() === detail.email.toLowerCase()));
    const repo = detail.role === 'Learner' ? this.learnersRepo : detail.role === 'Organization' ? this.orgsRepo : null;
    const profile = repo ? (await repo.find()).find(p => p.id === id || (!!account && p.userId === account.id) ||
      (detail.role === 'Organization' && p.id === account?.organizationId) ||
      (!!detail.email && p.email?.toLowerCase() === detail.email.toLowerCase())) : null;
    return { detail, account, profile, repo };
  }

  async update(id: string, dto: UpdateUserDto, actor = 'admin') {
    const { detail, account, profile, repo } = await this.accountRecords(id);
    if(detail.role==='Organization'&&dto.status&&['Pending Verification','Rejected'].includes(detail.status))throw new BadRequestException('Use organization verification before changing access.');
    if (['admin','superadmin'].includes(actor.toLowerCase())) {
      if(Object.keys(dto).some(key=>key!=='status'))throw new BadRequestException('Account owners manage their own details. Platform administrators can only change access.');
      if (detail.role === 'Instructor') throw new BadRequestException('Instructors are managed by their organization.');
      if (dto.role) throw new BadRequestException('Account type cannot be changed here.');
      if (dto.status && !['Learner', 'Organization', ...(actor.toLowerCase()==='superadmin'?['Admin']:[])].includes(detail.role)) {
        throw new BadRequestException('Only learners and organizations can be suspended here.');
      }
    }
    if (dto.status && !['Active', 'Suspended'].includes(dto.status)) throw new BadRequestException('Unsupported account status.');
    await this.db.runTransaction(async () => {
      if (account) await this.usersRepo.update(account.id, dto as any);
      if (repo && profile) await repo.update(profile.id, dto);
    });
    return this.findOne(account?.id || id);
  }

  async remove(id: string, actor = 'admin') {
    const { detail, account, profile, repo } = await this.accountRecords(id);
    if (detail.role === 'Instructor') throw new BadRequestException('Instructors are managed by their organization.');
    if (!['Learner', 'Organization'].includes(detail.role) && actor.toLowerCase() !== 'superadmin') {
      throw new BadRequestException('Only learners and organizations can be deleted here.');
    }
    if (detail.role === 'SuperAdmin') throw new BadRequestException('Super Admin accounts are protected.');
    await this.db.runTransaction(async () => {
      if (detail.role === 'Organization' && profile) {
        // Preserve teaching records while removing the deleted institution from active catalogs.
        const faculty = await this.instructorsRepo.find({ where: { organizationId: profile.id } });
        for (const instructor of faculty) {
          await this.instructorsRepo.update(instructor.id, { organizationId: null, organizationName: null, status: 'Pending Affiliation' });
          const instructorAccount = (await this.usersRepo.find()).find(user => user.id === instructor.userId || user.email === instructor.email);
          if (instructorAccount) await this.usersRepo.update(instructorAccount.id, { organizationId: null, organizationName: null, status: 'Pending Affiliation' } as any);
        }
        const courses = await this.coursesRepo.find({ where: { organizationId: profile.id } });
        for (const course of courses) await this.coursesRepo.update(course.id, { status: 'Archived' });
      }
      if (detail.role === 'Learner' && profile) {
        const certificates = new JsonRepository<any>('certificates', this.db);
        const credentials = await certificates.find({ where: { learnerId: { $in: [profile.id, account?.id].filter(Boolean) } } });
        for (const credential of credentials) await certificates.update(credential.id, {
          learnerName: profile.name || detail.name,
          learnerEmail: profile.email || detail.email,
        });
      }
      if (repo && profile) await repo.delete(profile.id);
      if (account) await this.usersRepo.delete(account.id);
    });
    return { success: true, message: `Account '${id}' permanently deleted` };
  }
}
