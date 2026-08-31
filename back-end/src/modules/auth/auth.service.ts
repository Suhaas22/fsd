import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { UserEntity } from '../../database/schema';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepo: JsonRepository<UserEntity>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ email: dto.email });
    if (!user) {
      // If not in users repo, try matching in learners or instructors
      const learner = await this.learnersRepo.findOne({ email: dto.email });
      if (learner) {
        return {
          token: `jwt-token-${learner.id}-${Date.now()}`,
          user: {
            id: learner.id,
            name: learner.name,
            email: learner.email,
            role: 'Student',
            avatar: learner.avatar,
            university: learner.university,
          },
        };
      }
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    if (user.password && user.password !== dto.password) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    // Update lastLogin
    await this.usersRepo.update(user.id, { lastLogin: new Date().toISOString() });

    return {
      token: `jwt-token-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        verificationStatus: user.verificationStatus,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({ email: dto.email });
    if (existing) {
      throw new BadRequestException('A user with this email address already exists');
    }

    const newUser = await this.usersRepo.create({
      id: `usr-${Date.now()}`,
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      status: 'Active',
      verificationStatus: 'Verified',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    });

    if (dto.role === 'Student') {
      await this.learnersRepo.create({
        id: `lrn-${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        learnerType: 'Undergraduate',
        university: dto.university || 'General Open Enrollee',
        enrolledCourses: 0,
        overallProgress: 0,
        certificatesEarned: 0,
        status: 'Active',
      });
    } else if (dto.role === 'Instructor') {
      await this.instructorsRepo.create({
        id: `inst-${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        educatorType: 'Faculty Instructor',
        specialization: dto.expertise || 'Computer Science',
        bio: 'Newly registered faculty educator on the platform.',
        status: 'Active',
        coursesCount: 0,
        enrolledStudents: 0,
        avgRating: 5.0,
        revenueGenerated: 0,
      });
    }

    return {
      token: `jwt-token-${newUser.id}-${Date.now()}`,
      user: newUser,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User session not found');
    }
    if (user.password && user.password !== dto.currentPassword) {
      throw new BadRequestException('Current password does not match');
    }

    await this.usersRepo.update(userId, { password: dto.newPassword });
    return { success: true, message: 'Password successfully updated' };
  }

  async getMe(userId: string) {
    const user = await this.usersRepo.findById(userId);
    if (user) return user;
    const learner = await this.learnersRepo.findById(userId);
    if (learner) return { ...learner, role: 'Student' };
    const inst = await this.instructorsRepo.findById(userId);
    if (inst) return { ...inst, role: 'Instructor' };
    return {
      id: userId,
      name: 'Authenticated User',
      role: 'Student',
      email: 'user@platform.io',
    };
  }
}
