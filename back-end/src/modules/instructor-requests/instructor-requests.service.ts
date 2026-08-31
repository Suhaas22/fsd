import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import {
  CreateTeachingRequestDto,
  InstructorRequestQueryDto,
  RespondTeachingRequestDto,
  TeachingRequestDecision,
  WithdrawTeachingRequestDto,
} from './dto/instructor-request.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class InstructorRequestsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.INSTRUCTOR_REQUESTS)
    private readonly requestsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>
  ) {}

  async findAll(query: InstructorRequestQueryDto) {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (status && status !== 'All') {
      if (status.toLowerCase().includes('pending')) {
        where.status = { $regex: /pending|sent/i };
      } else if (status.toLowerCase().includes('accepted')) {
        where.status = { $regex: /accepted/i };
      } else if (status.toLowerCase().includes('declined')) {
        where.status = { $regex: /declined/i };
      } else {
        where.status = status;
      }
    }

    if (search) {
      where.$or = [
        { name: { $contains: search } },
        { email: { $contains: search } },
        { courseTitle: { $contains: search } },
        { specialization: { $contains: search } },
      ];
    }

    return this.requestsRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string) {
    const request = await this.requestsRepo.findById(id);
    if (!request) {
      throw new NotFoundException(`Teaching request with ID '${id}' not found`);
    }
    return request;
  }

  async create(dto: CreateTeachingRequestDto) {
    const instructor = await this.instructorsRepo.findById(dto.instructorId);
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID '${dto.instructorId}' not found`);
    }

    const courseTitle = dto.courseTitle || 'Advanced Distributed Systems';
    const semester = dto.semester || 'Fall 2026';
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const newRequest = await this.requestsRepo.create({
      instructorId: instructor.id,
      courseId: dto.courseId || null,
      name: instructor.name,
      email: instructor.email,
      avatar: instructor.avatar,
      specialization: instructor.specialization,
      courseTitle,
      semester,
      creditHours: dto.creditHours || '4 Academic Credits',
      submittedDate: dateStr,
      sentDate: dateStr,
      status: 'Pending Professor Response',
      outreachMethod: 'Sent request by mail',
      mailSubject: `College Teaching Request: ${courseTitle} (${semester})`,
      description: dto.message || `College administration sent formal course teaching request by mail to ${instructor.name} to teach '${courseTitle}' for ${semester}.`,
      bio: instructor.bio,
      sampleSyllabus: `Curriculum and lab syllabus for ${courseTitle}`,
      proposedTerms: dto.proposedTerms || 'Departmental faculty honorarium + course royalties',
      trackingStatus: `Awaiting professor decision • Dispatched to ${instructor.email}`,
      adminNotes: 'Dispatched by Academic Dean via college mail server.',
    });

    await this.notifsRepo.create({
      title: `Teaching Invitation Dispatched: ${instructor.name}`,
      desc: `Formal course teaching request sent to ${instructor.name} for "${courseTitle}".`,
      time: 'Just now',
      category: 'Instructor',
      read: false,
      color: 'blue',
    });

    return newRequest;
  }

  async respond(id: string, dto: RespondTeachingRequestDto) {
    const request = await this.requestsRepo.findById(id);
    if (!request) {
      throw new NotFoundException(`Teaching request with ID '${id}' not found`);
    }

    const isAccepted = dto.decision === TeachingRequestDecision.ACCEPTED;
    const newStatus = isAccepted ? 'Accepted by Professor' : 'Declined by Professor';
    const tracking = isAccepted
      ? 'Accepted by Professor • Official Notification Sent to College'
      : 'Declined by Professor (Sabbatical/Schedule conflict)';

    const updatedRequest = await this.requestsRepo.update(id, {
      status: newStatus,
      trackingStatus: tracking,
      adminNotes: dto.notes
        ? `${request.adminNotes || ''} • ${dto.notes}`
        : request.adminNotes,
    });

    // Create system notification
    await this.notifsRepo.create({
      title: isAccepted
        ? `Professor ${request.name} Accepted Course Assignment`
        : `Teaching Request Declined: ${request.name}`,
      desc: isAccepted
        ? `Great news! ${request.name} has accepted the college request to teach "${request.courseTitle || 'the course'}" for ${request.semester || 'the semester'}.`
        : `${request.name} declined the teaching request for "${request.courseTitle || 'the course'}".`,
      time: 'Just now',
      category: 'Instructor',
      read: false,
      color: isAccepted ? 'green' : 'amber',
    });

    // If accepted, add instructor to course team
    if (isAccepted) {
      const courses = await this.coursesRepo.find();
      const matchedCourse = courses.find((c) =>
        request.courseId
          ? c.id === request.courseId
          : c.title.toLowerCase() === (request.courseTitle || '').toLowerCase()
      );

      if (matchedCourse) {
        const instructor = await this.instructorsRepo.findById(request.instructorId);
        if (instructor) {
          const currentInstructors = matchedCourse.instructors || [];
          const exists = currentInstructors.some((inst: any) => inst.id === instructor.id);

          if (!exists) {
            const updatedTeam = [
              ...currentInstructors,
              {
                id: instructor.id,
                name: instructor.name,
                role: 'Co-Instructor',
                avatar: instructor.avatar,
                specialization: instructor.specialization,
              },
            ];

            await this.coursesRepo.update(matchedCourse.id, {
              instructors: updatedTeam,
              instructorName: updatedTeam.map((i: any) => i.name).join(', '),
            });
          }
        }
      }
    }

    return updatedRequest;
  }

  async withdraw(id: string, dto: WithdrawTeachingRequestDto) {
    const request = await this.requestsRepo.findById(id);
    if (!request) {
      throw new NotFoundException(`Teaching request with ID '${id}' not found`);
    }

    return this.requestsRepo.update(id, {
      status: 'Declined by College',
      trackingStatus: 'Invitation withdrawn by organization administration',
      adminNotes: dto.reason
        ? `${request.adminNotes || ''} • Withdrawn: ${dto.reason}`
        : 'Withdrawn by administration',
    });
  }

  async resend(id: string) {
    const request = await this.requestsRepo.findById(id);
    if (!request) {
      throw new NotFoundException(`Teaching request with ID '${id}' not found`);
    }

    const updated = await this.requestsRepo.update(id, {
      sentDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      trackingStatus: `Reminder dispatched via Mail • Resent to ${request.email}`,
    });

    await this.notifsRepo.create({
      title: `Outreach Email Resent: ${request.name}`,
      desc: `Teaching request reminder email resent to ${request.email} for "${request.courseTitle}".`,
      time: 'Just now',
      category: 'Instructor',
      read: false,
      color: 'blue',
    });

    return updated;
  }

  async delete(id: string) {
    const request = await this.requestsRepo.findById(id);
    if (!request) {
      throw new NotFoundException(`Teaching request with ID '${id}' not found`);
    }
    return this.requestsRepo.delete(id);
  }
}
