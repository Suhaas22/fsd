import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { CourseQueryDto, CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>
  ) {}

  async findAll(query: CourseQueryDto) {
    const { page = 1, limit = 10, search, category, level, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (category && category !== 'All') {
      where.category = category;
    }

    if (level && level !== 'All') {
      where.level = level;
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (search) {
      where.$or = [
        { title: { $contains: search } },
        { category: { $contains: search } },
        { instructorName: { $contains: search } },
        { description: { $contains: search } },
      ];
    }

    return this.coursesRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string) {
    const course = await this.coursesRepo.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }

    // Populate recent enrollments for this course
    const enrollments = await this.enrollmentsRepo.find({
      where: { courseId: id },
      limit: 10,
    });

    return {
      ...course,
      recentEnrollments: enrollments,
    };
  }

  async create(dto: CreateCourseDto) {
    const instructorsList = await this.resolveInstructors(dto);
    const leadInstructor = instructorsList[0] || {
      id: 'inst-1',
      name: 'Prof. James Wilson',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      specialization: 'Cloud Architecture & AWS',
    };

    const modules = dto.modules || [
      { id: 'mod-1', title: 'Module 1: Architecture Foundations', lessons: 4, duration: '3h 15m' },
      { id: 'mod-2', title: 'Module 2: High Throughput Replication', lessons: 5, duration: '4h 00m' },
    ];

    const lessonsCount = modules.reduce((sum, m) => sum + (m.lessons || 3), 0);

    const newCourse = await this.coursesRepo.create({
      title: dto.title,
      category: dto.category || 'Cloud Architecture',
      level: dto.level || 'Advanced',
      instructorId: leadInstructor.id,
      instructorName: instructorsList.map((i) => i.name).join(', '),
      leadInstructorName: leadInstructor.name,
      instructors: instructorsList,
      enrolledCount: 0,
      price: typeof dto.price === 'number' ? dto.price : 89.99,
      revenue: 0,
      rating: 5.0,
      totalHours: '18h 30m',
      lessonsCount,
      modulesCount: modules.length,
      status: dto.status || 'Published',
      thumbnail: dto.thumbnail || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
      description: dto.description || 'Newly authored masterclass curriculum.',
      modules,
    });

    return newCourse;
  }

  async update(id: string, dto: UpdateCourseDto) {
    const existing = await this.coursesRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }

    let updatedInstructors = dto.instructors || existing.instructors || [];

    if (dto.instructorId || dto.coInstructorIds) {
      updatedInstructors = await this.resolveInstructors(dto);
    }

    const leadInst = updatedInstructors[0] || { id: existing.instructorId, name: existing.leadInstructorName };

    const modules = dto.modules || existing.modules || [];
    const lessonsCount = modules.reduce((sum: number, m: any) => sum + (m.lessons || 3), 0);

    return this.coursesRepo.update(id, {
      ...dto,
      instructors: updatedInstructors,
      instructorId: leadInst.id,
      leadInstructorName: leadInst.name,
      instructorName: updatedInstructors.map((i: any) => i.name).join(', '),
      modules,
      modulesCount: modules.length,
      lessonsCount,
      price: typeof dto.price === 'number' ? dto.price : existing.price,
    });
  }

  async delete(id: string) {
    const existing = await this.coursesRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }
    return this.coursesRepo.delete(id);
  }

  private async resolveInstructors(dto: { instructorId?: string; coInstructorIds?: string[]; instructors?: any[] }) {
    if (dto.instructors && Array.isArray(dto.instructors) && dto.instructors.length > 0) {
      return dto.instructors;
    }

    const allInstructors = await this.instructorsRepo.find();
    const lead = allInstructors.find((i) => i.id === dto.instructorId) || allInstructors[0];

    const result = [
      {
        id: lead.id,
        name: lead.name,
        role: 'Lead Instructor',
        avatar: lead.avatar,
        specialization: lead.specialization,
      },
    ];

    if (Array.isArray(dto.coInstructorIds)) {
      dto.coInstructorIds.forEach((coId) => {
        if (coId !== lead.id) {
          const co = allInstructors.find((i) => i.id === coId);
          if (co) {
            result.push({
              id: co.id,
              name: co.name,
              role: 'Co-Instructor',
              avatar: co.avatar,
              specialization: co.specialization,
            });
          }
        }
      });
    }

    return result;
  }
}
