import { randomUUID } from 'crypto';
import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonDatabaseService } from '../../database/json-db.service';
import { JsonRepository } from '../../database/json-repository';
import { UserEntity } from '../../database/schema';
import { LoginDto, RegisterDto, ChangePasswordDto, PasswordResetConfirmDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly passwordResetCodes = new Map<string, { code: string; expiresAt: number }>();
  constructor(
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepo: JsonRepository<UserEntity>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATIONS) private readonly organizationsRepo:JsonRepository<any>,
    private readonly db:JsonDatabaseService
  ) {}

  private meetsPasswordCriteria(password: string) {
    return (
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password) &&
      password.length >= 6
    );
  }

  private ensurePasswordCriteria(password: string) {
    if (!this.meetsPasswordCriteria(password)) {
      throw new BadRequestException(
        'Password must include an uppercase letter, lowercase letter, number, special symbol, and at least 6 characters',
      );
    }
  }

  private normalizeRole(role?: string) {
    const value = String(role || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
    return ({
      learner: 'student',
      educator: 'instructor',
      faculty: 'instructor',
      org: 'organization',
      superadmin: 'superadmin',
    } as Record<string, string>)[value] || value;
  }

  private rolesMatch(accountRole: string, requestedRole?: string) {
    if (!requestedRole) return true;

    const account = this.normalizeRole(accountRole);
    const requested = this.normalizeRole(requestedRole);

    if (account === requested) return true;
    // SuperAdmin has top-level permissions to also sign into Admin portal if desired
    if (account === 'superadmin' && requested === 'admin') return true;

    return false;
  }

  async login(dto: LoginDto) {
    this.ensurePasswordCriteria(dto.password);
    const email=String(dto.email||'').trim().toLowerCase();
    const user=(await this.usersRepo.find()).find(u=>String(u.email||'').toLowerCase()===email);
    if(!user)throw new UnauthorizedException('Invalid email or password credentials');

    if(user.role==='Organization'&&['Pending Verification','Rejected'].includes(user.status))throw new UnauthorizedException(user.status==='Rejected'?'Organization verification was rejected. Contact platform support.':'Your organization is awaiting administrator verification.');
    if (user.status === 'Suspended') throw new UnauthorizedException('This account is suspended.');
    if (!user.password || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    if (!this.rolesMatch(user.role, dto.role)) throw new UnauthorizedException('This account does not have the selected role');

    if(this.normalizeRole(user.role)==='instructor'){const profile=(await this.instructorsRepo.find()).find(i=>i.userId===user.id||i.email?.toLowerCase()===email);if(profile?.status==='Suspended')throw new UnauthorizedException('This instructor account is suspended.');}

    // Update lastLogin
    await this.usersRepo.update(user.id, { lastLogin: new Date().toISOString() });

    const normalizedAccount = this.normalizeRole(user.role as string);
    const normalizedRequested = this.normalizeRole(dto.role);

    let resolvedRole = user.role;
    if (
      normalizedAccount === 'superadmin' ||
      user.id === 'usr-10' ||
      user.email?.toLowerCase() === 'superadmin@platform.io'
    ) {
      resolvedRole = normalizedRequested === 'admin' ? 'Admin' : 'SuperAdmin';
    } else if (normalizedRequested === 'superadmin') {
      throw new UnauthorizedException('Access denied. Super Admin privileges required.');
    }

    let orgId = user.organizationId || null;
    let orgName = user.organizationName || null;
    let status = user.status || 'Active';
    let instructorId = null;

    if (user.role === 'Instructor') {
      const inst = (await this.instructorsRepo.findOne({ userId: user.id })) ||
                   (await this.instructorsRepo.findOne({ email: user.email }));
      if (inst) {
        instructorId = inst.id;
        orgId = inst.organizationId || user.organizationId || null;
        orgName = inst.organizationName || user.organizationName || null;
        status = inst.status || user.status || 'Pending Affiliation';
      } else {
        status = user.organizationId ? 'Active' : 'Pending Affiliation';
      }
    }

    return {
      token: `jwt-token-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        instructorId,
        name: user.name,
        email: user.email,
        role: resolvedRole,
        avatar: user.avatar,
        verificationStatus: user.verificationStatus,
        organizationId: orgId,
        organizationName: orgName,
        status,
      },
    };
  }

  async register(dto: RegisterDto) {
    if(!['Student','Instructor','Organization'].includes(dto.role))throw new BadRequestException('Administrator accounts cannot be created through public registration.');
    this.ensurePasswordCriteria(dto.password);
    dto.email=dto.email.trim().toLowerCase();dto.name=String(dto.name||'').trim();if(dto.name.length<2||dto.name.length>160)throw new BadRequestException('Enter a name between 2 and 160 characters.');
    return this.db.runTransaction(async()=>{
    const existing = await this.usersRepo.findOne({ email: dto.email });
    if (existing) {
      throw new BadRequestException('A user with this email address already exists');
    }

    const initialStatus = dto.role === 'Organization' ? 'Pending Verification' : dto.role === 'Instructor' ? 'Pending Affiliation' : 'Active';

    const newUser = await this.usersRepo.create({
      id: `usr-${randomUUID()}`,
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      status: initialStatus,
      verificationStatus: dto.role==='Organization'?'Pending':'Verified',
      organizationId: null,
      organizationName: null,
      avatar: null,
      createdAt: new Date().toISOString(),
    });

    let instructorId: string | null = null;
    let organizationId: string | null = null;

    if (dto.role === 'Student') {
      await this.learnersRepo.create({
        id: `lrn-${randomUUID()}`,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        learnerType: 'Undergraduate',
        university: dto.university || null,
        enrolledCourses: 0,
        overallProgress: 0,
        certificatesEarned: 0,
        status: 'Active',
      });
    } else if (dto.role === 'Instructor') {
      instructorId = `inst-${randomUUID()}`;
      await this.instructorsRepo.create({
        id: instructorId,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        educatorType: 'Faculty Instructor',
        specialization: dto.expertise || null,
        bio: null,
        status: 'Pending Affiliation',
        organizationId: null,
        organizationName: null,
        coursesCount: 0,
        enrolledStudents: 0,
        avgRating: null,
        revenueGenerated: 0,
        createdAt: new Date().toISOString(),
      });
    }

    if(dto.role==='Organization'){
      const org=await this.organizationsRepo.create({name:newUser.name,email:newUser.email,userId:newUser.id,status:'Pending Verification',verificationStatus:'Pending',currency:'INR',instructorIds:[],coursesCount:0,learnersCount:0,totalRevenue:0,monthlyRevenue:0,createdAt:new Date().toISOString()});
      organizationId=org.id;
      await this.usersRepo.update(newUser.id,{organizationId:org.id,organizationName:org.name});
    }

    if(dto.role==='Organization'){await new JsonRepository<any>('notifications',this.db).create({title:'Organization verification requested',desc:`${newUser.name} registered and needs verification.`,recipientRole:'admin',category:'OrganizationVerification',actionUrl:`/admin/users/${newUser.id}`,read:false,createdAt:new Date().toISOString()});return {pendingVerification:true,token:null,user:{organizationId,organizationName:newUser.name,id:newUser.id,name:newUser.name,email:newUser.email,role:newUser.role,status:initialStatus},message:'Organization registered. An administrator must verify your account before you can sign in.'};}
    const {password: storedPassword,...publicUser}=newUser;
    return {
      token: `jwt-token-${newUser.id}-${Date.now()}`,
      user: {
        ...publicUser,
        instructorId,
        organizationId,
        organizationName: organizationId?newUser.name:null,
        status: initialStatus,
      },
    };
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User session not found');
    }
    if (user.password && user.password !== dto.currentPassword) {
      throw new BadRequestException('Current password does not match');
    }

    this.ensurePasswordCriteria(dto.newPassword);
    await this.usersRepo.update(userId, { password: dto.newPassword });
    return { success: true, message: 'Password successfully updated' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersRepo.findOne({ email });
    if (!user) {
      // Do not disclose whether an account exists in a production email flow.
      return { message: 'If an account exists for this email, a recovery code has been sent.' };
    }

    // This JSON-backed local project has no mail provider. Configure RESET_CODE or
    // replace this with your email provider before deploying.
    const code = process.env.RESET_CODE || '482910';
    this.passwordResetCodes.set(email.toLowerCase(), {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    return {
      message: `Recovery code created. For local development, use ${code}.`,
    };
  }

  async confirmPasswordReset(dto: PasswordResetConfirmDto) {
    const reset = this.passwordResetCodes.get(dto.email.toLowerCase());
    if (!reset || reset.expiresAt < Date.now() || reset.code !== dto.code) {
      throw new BadRequestException('The recovery code is invalid or has expired');
    }

    const user = await this.usersRepo.findOne({ email: dto.email });
    if (!user) {
      throw new BadRequestException('The recovery request is no longer valid');
    }

    await this.usersRepo.update(user.id, { password: dto.newPassword, updatedAt: new Date().toISOString() });
    this.passwordResetCodes.delete(dto.email.toLowerCase());
    return { success: true, message: 'Your password has been reset successfully.' };
  }

  async getMe(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (user) {
      if (user.role === 'Instructor') {
        const inst = (await this.instructorsRepo.findOne({ userId: user.id })) ||
                     (await this.instructorsRepo.findOne({ email: user.email }));
        return {
          ...user,
          instructorId: inst?.id || null,
          organizationId: inst?.organizationId || user.organizationId || null,
          organizationName: inst?.organizationName || user.organizationName || null,
          status: inst?.status || user.status || 'Pending Affiliation',
        };
      }
      return user;
    }
    const learner = await this.learnersRepo.findById(userId);
    if (learner) return { ...learner, role: 'Student' };
    const inst = await this.instructorsRepo.findById(userId);
    if (inst) {
      return {
        ...inst,
        instructorId: inst.id,
        role: 'Instructor',
        organizationId: inst.organizationId || null,
        organizationName: inst.organizationName || null,
        status: inst.status || 'Pending Affiliation',
      };
    }
    return {
      id: userId,
      name: 'Authenticated User',
      role: 'Student',
      email: 'user@platform.io',
    };
  }
}
