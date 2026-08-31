import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
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
    private readonly instructorsRepo: JsonRepository<any>
  ) {}

  async findAll() {
    return this.usersRepo.find();
  }

  async findOne(id: string) {
    const user = await this.usersRepo.findById(id);
    if (!user) {
      // Fallback search in learners or instructors
      const learner = await this.learnersRepo.findById(id);
      if (learner) return { ...learner, role: 'Student' };
      const instructor = await this.instructorsRepo.findById(id);
      if (instructor) return { ...instructor, role: 'Instructor' };
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return user;
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
    return newUser;
  }

  async update(id: string, dto: UpdateUserDto) {
    const updated = await this.usersRepo.update(id, dto as any);
    if (!updated) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.usersRepo.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return { success: true, message: `User '${id}' removed` };
  }
}
