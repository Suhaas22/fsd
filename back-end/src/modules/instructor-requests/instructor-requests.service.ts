import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import {
  CreateJoinRequestDto,
  CreateTeachingRequestDto,
  DecideJoinRequestDto,
  InstructorRequestQueryDto,
  RespondTeachingRequestDto,
  TeachingRequestDecision,
  WithdrawTeachingRequestDto,
} from './dto/instructor-request.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

export const JOIN_STATUS = {
  PENDING: 'Pending Organization Approval',
  APPROVED: 'Approved by Organization',
  REJECTED: 'Rejected by Organization',
  CANCELLED: 'Cancelled by Instructor',
};

const isPending = (status?: string) => /pending|sent/i.test(status || '');
const isJoin = (r: any) => r?.type === 'join';
const legacyOrganizationIds: Record<string, string> = {
  'org-101': 'org-1',
  'org-102': 'org-2',
};
const belongsToOrganization = (recordOrganizationId?: string, organizationId?: string) =>
  !recordOrganizationId ||
  recordOrganizationId === organizationId ||
  legacyOrganizationIds[recordOrganizationId] === organizationId;

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
    private readonly notifsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ORGANIZATIONS)
    private readonly orgsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.USERS)
    private readonly usersRepo: JsonRepository<any>,
  ) {}

  // ── Identity helpers ────────────────────────────────────────────

  private async instructorForUser(userId?: string) {
    if (!userId) throw new BadRequestException('Missing x-user-id header');
    const all = await this.instructorsRepo.find();
    const instructor = all.find((i) => i.userId === userId || i.id === userId);
    if (!instructor) throw new ForbiddenException('Only instructors can perform this action');
    return instructor;
  }

  private async orgForAdmin(userEmail?: string) {
    if (!userEmail) throw new BadRequestException('Missing x-user-email header');
    const orgs = await this.orgsRepo.find();
    const org = orgs.find((o) => o.email?.toLowerCase() === userEmail.toLowerCase());
    if (!org) throw new ForbiddenException('Only organization admins can perform this action');
    return org;
  }

  private isAffiliated(instructor: any) {
    return Boolean(instructor?.organizationId) && instructor.status === 'Active';
  }

  private async affiliate(instructor: any, org: any) {
    const now = new Date().toISOString();
    await this.instructorsRepo.update(instructor.id, {
      organizationId: org.id,
      organizationName: org.name,
      status: 'Active',
      orgJoinedAt: now,
    });
    const user = instructor.userId
      ? await this.usersRepo.findById(instructor.userId)
      : await this.usersRepo.findOne({ email: instructor.email });
    if (user) {
      await this.usersRepo.update(user.id, { organizationId: org.id, organizationName: org.name, status: 'Active' });
    }
    const roster = org.instructorIds || [];
    if (!roster.includes(instructor.id)) {
      await this.orgsRepo.update(org.id, { instructorIds: [...roster, instructor.id] });
    }
  }

  // ── Listing ─────────────────────────────────────────────────────

  async findAll(query: InstructorRequestQueryDto) {
    const { page = 1, limit = 10, search, status, instructorId, email, organizationId, type, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const where: QueryFilter<any> = {};

    if (instructorId) where.instructorId = instructorId;
    if (organizationId) where.organizationId = organizationId;
    if (email) where.email = { $contains: email };

    if (status && status !== 'All') {
      const s = status.toLowerCase();
      if (s.includes('pending')) where.status = { $regex: /pending|sent/i };
      else if (s.includes('accepted') || s.includes('approved')) where.status = { $regex: /accepted|approved/i };
      else if (s.includes('declined') || s.includes('rejected')) where.status = { $regex: /declined|rejected/i };
      else where.status = status;
    }

    if (search) {
      where.$or = [
        { name: { $contains: search } },
        { email: { $contains: search } },
        { courseTitle: { $contains: search } },
        { specialization: { $contains: search } },
      ];
    }

    if (!type) {
      return this.requestsRepo.findAndCount({ where, skip: (page - 1) * limit, limit, sort: { [sortBy]: sortOrder } });
    }

    const all = (await this.requestsRepo.findAndCount({ where, sort: { [sortBy]: sortOrder } })).items.filter((r) =>
      type === 'join' ? isJoin(r) : !isJoin(r)
    );
    const totalPages = Math.ceil(all.length / limit) || 1;
    return {
      items: all.slice((page - 1) * limit, page * limit),
      total: all.length,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string) {
    const request = await this.requestsRepo.findById(id);
    if (!request) throw new NotFoundException(`Request '${id}' not found`);
    return request;
  }

  // ── Organization → instructor teaching invitations ──────────────

  async create(dto: CreateTeachingRequestDto) {
    const instructor = await this.instructorsRepo.findById(dto.instructorId);
    if (!instructor) throw new NotFoundException(`Instructor '${dto.instructorId}' not found`);
    if (instructor.status === 'Suspended') throw new BadRequestException('This instructor is suspended.');
    if (!dto.organizationId) throw new BadRequestException('organizationId is required');

    const org = await this.orgsRepo.findById(dto.organizationId);
    if (!org) throw new NotFoundException(`Organization '${dto.organizationId}' not found`);

    const isCourseAssignment = Boolean(dto.courseId) || (Boolean(dto.courseTitle) && dto.courseTitle !== 'General Course Assignment');

    let courseTitle = dto.courseTitle;
    let course: any = null;

    if (isCourseAssignment) {
      // Rule: An instructor MUST be already associated with this organization before receiving course requests!
      if (!this.isAffiliated(instructor) || instructor.organizationId !== org.id) {
        throw new BadRequestException(
          `${instructor.name} is not associated with ${org.name}. Instructors must be affiliated members of your organization before being assigned to teach a course.`
        );
      }

      if (dto.courseId) {
        course = await this.coursesRepo.findById(dto.courseId);
        if (!course) throw new NotFoundException(`Course '${dto.courseId}' not found`);
        if (!belongsToOrganization(course.organizationId, org.id)) {
          throw new ForbiddenException('This course belongs to another organization');
        }
        courseTitle = course.title;
      }
      if (!courseTitle) throw new BadRequestException('courseId or courseTitle is required for course assignment');
    } else {
      // Rule: Organization association invitation.
      // If the instructor is ALREADY associated with ANY organization, they CANNOT receive invitations!
      if (this.isAffiliated(instructor)) {
        if (instructor.organizationId === org.id) {
          throw new BadRequestException(`${instructor.name} is already a faculty member of your organization.`);
        } else {
          throw new BadRequestException(
            `${instructor.name} is already associated with ${instructor.organizationName || 'another organization'} and cannot receive invitations.`
          );
        }
      }
    }

    const duplicate = (await this.requestsRepo.find({ where: { instructorId: instructor.id, organizationId: org.id } })).find(
      (r) => !isJoin(r) && isPending(r.status) && (
        isCourseAssignment
          ? (r.courseId === (dto.courseId || course?.id) || r.courseTitle === courseTitle)
          : (r.type === 'org-invitation' || !r.courseId)
      )
    );
    if (duplicate) {
      throw new ConflictException(
        isCourseAssignment
          ? 'A pending invitation for this course already exists'
          : 'A pending faculty invitation has already been sent to this instructor'
      );
    }

    const now = new Date();
    const request = await this.requestsRepo.create({
      type: isCourseAssignment ? 'course-assignment' : 'org-invitation',
      instructorId: instructor.id,
      courseId: isCourseAssignment ? (dto.courseId || course?.id || null) : null,
      organizationId: org.id,
      organizationName: org.name,
      name: instructor.name,
      email: instructor.email,
      avatar: instructor.avatar,
      specialization: instructor.specialization,
      courseTitle: isCourseAssignment ? courseTitle : null,
      semester: isCourseAssignment ? (dto.semester || null) : null,
      creditHours: isCourseAssignment ? (dto.creditHours || null) : null,
      proposedTerms: dto.proposedTerms || null,
      description: dto.message || (isCourseAssignment ? '' : `You have been invited to join the faculty of ${org.name}.`),
      submittedDate: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Pending Professor Response',
      trackingStatus: `Awaiting decision from ${instructor.name}`,
    });

    await this.notifsRepo.create({
      title: isCourseAssignment
        ? `Course assignment sent to ${instructor.name}`
        : `Faculty invitation sent to ${instructor.name}`,
      desc: isCourseAssignment
        ? `${org.name} assigned ${instructor.name} to teach "${courseTitle}".`
        : `${org.name} invited ${instructor.name} to join their faculty.`,
      time: 'Just now',
      category: 'Instructor',
      read: false,
      color: 'blue',
      organizationId: org.id,
      instructorId: instructor.id,
    });
    return request;
  }

  async respond(id: string, dto: RespondTeachingRequestDto) {
    const request = await this.findOne(id);
    if (isJoin(request)) throw new BadRequestException('Join requests are decided by the organization');
    if (!isPending(request.status)) throw new BadRequestException('This invitation has already been resolved');

    const instructor = await this.instructorsRepo.findById(request.instructorId);
    if (!instructor) throw new NotFoundException('Instructor no longer exists');
    const accepted = dto.decision === TeachingRequestDecision.ACCEPTED;

    const isCourseAssignment = request.type === 'course-assignment' || Boolean(request.courseId);

    if (accepted) {
      if (isCourseAssignment) {
        // Must be affiliated with this organization to accept a course from it
        if (!this.isAffiliated(instructor) || instructor.organizationId !== request.organizationId) {
          throw new BadRequestException(`You are not associated with ${request.organizationName}. You can only accept courses from your associated organization.`);
        }
      } else {
        // Org invitation
        if (this.isAffiliated(instructor) && instructor.organizationId !== request.organizationId) {
          throw new BadRequestException(`Leave ${instructor.organizationName} before accepting an invitation from another organization`);
        }
      }
    }

    const updated = await this.requestsRepo.update(id, {
      status: accepted ? 'Accepted by Professor' : 'Declined by Professor',
      trackingStatus: accepted
        ? (isCourseAssignment ? 'Accepted — instructor added to course' : 'Accepted — instructor joined organization')
        : (isCourseAssignment ? 'Declined by instructor' : 'Declined faculty invitation'),
      respondedAt: new Date().toISOString(),
      instructorNotes: dto.notes || null,
    });

    if (accepted) {
      if (!isCourseAssignment) {
        // Stage 1: Affiliate instructor with the inviting organization
        const org = await this.orgsRepo.findById(request.organizationId);
        if (org) await this.affiliate(instructor, org);
      } else {
        // Stage 2: Add instructor to course
        let course = request.courseId ? await this.coursesRepo.findById(request.courseId) : null;
        if (!course && request.courseTitle) {
          const allCourses = await this.coursesRepo.find();
          course = allCourses.find((c: any) =>
            (c.title?.toLowerCase() === request.courseTitle?.toLowerCase() || c.id === request.courseId) &&
            (!request.organizationId || c.organizationId === request.organizationId)
          ) || null;
        }

        if (course) {
          const team = Array.isArray(course.instructors) ? [...course.instructors] : [];
          if (!team.some((m: any) => m.id === instructor.id)) {
            const role = team.length === 0 ? 'Lead Instructor' : 'Co-Instructor';
            team.push({
              id: instructor.id,
              name: instructor.name,
              role,
              avatar: instructor.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
              specialization: instructor.specialization || 'Faculty Instructor',
            });

            const updatePayload: any = {
              instructors: team,
              coInstructorIds: team.map((i: any) => i.id).filter((id: string) => id !== (course.instructorId || instructor.id)),
            };

            if (!course.instructorId || team.length === 1) {
              updatePayload.instructorId = instructor.id;
              updatePayload.instructorName = instructor.name;
              updatePayload.leadInstructorName = instructor.name;
            }

            await this.coursesRepo.update(course.id, updatePayload);
            await this.instructorsRepo.update(instructor.id, { coursesCount: (instructor.coursesCount || 0) + 1 });
          }
        }
      }
    }

    await this.notifsRepo.create({
      title: accepted ? `${request.name} accepted your invitation` : `${request.name} declined your invitation`,
      desc: isCourseAssignment
        ? `Teaching invitation for "${request.courseTitle}".`
        : `Faculty invitation to join ${request.organizationName}.`,
      time: 'Just now',
      category: 'Instructor',
      read: false,
      color: accepted ? 'green' : 'amber',
      organizationId: request.organizationId,
    });

    return updated;
  }

  async withdraw(id: string, dto: WithdrawTeachingRequestDto) {
    const request = await this.findOne(id);
    if (isJoin(request)) throw new BadRequestException('Use the join-request endpoints');
    if (!isPending(request.status)) throw new BadRequestException('Only pending invitations can be withdrawn');
    return this.requestsRepo.update(id, {
      status: 'Withdrawn by Organization',
      trackingStatus: dto.reason ? `Withdrawn: ${dto.reason}` : 'Withdrawn by organization',
    });
  }

  async resend(id: string) {
    const request = await this.findOne(id);
    if (isJoin(request) || !isPending(request.status)) {
      throw new BadRequestException('Only pending invitations can be resent');
    }
    const updated = await this.requestsRepo.update(id, {
      lastReminderAt: new Date().toISOString(),
      trackingStatus: `Reminder sent to ${request.email}`,
    });
    await this.notifsRepo.create({
      title: `Reminder sent to ${request.name}`,
      desc: `Reminder for the "${request.courseTitle}" teaching invitation.`,
      time: 'Just now',
      category: 'Instructor',
      read: false,
      color: 'blue',
      organizationId: request.organizationId,
      instructorId: request.instructorId,
    });
    return updated;
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.requestsRepo.delete(id);
  }

  // ── Instructor → organization join requests ─────────────────────

  async myJoinRequests(userId?: string) {
    const instructor = await this.instructorForUser(userId);
    const all = await this.requestsRepo.find({ where: { instructorId: instructor.id } });
    return all.filter(isJoin).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  async createJoinRequest(userId: string, dto: CreateJoinRequestDto) {
    throw new BadRequestException(
      'Instructors cannot request to join an organization. Organizations must initiate and send an invitation directly to the instructor.'
    );
  }

  async cancelJoinRequest(userId: string, id: string) {
    const instructor = await this.instructorForUser(userId);
    const request = await this.findOne(id);
    if (!isJoin(request) || request.instructorId !== instructor.id) throw new ForbiddenException('Not your join request');
    if (!isPending(request.status)) throw new BadRequestException('This request has already been decided');
    return this.requestsRepo.update(id, { status: JOIN_STATUS.CANCELLED, decidedAt: new Date().toISOString() });
  }

  async orgJoinRequests(userEmail?: string) {
    const org = await this.orgForAdmin(userEmail);
    const all = await this.requestsRepo.find({ where: { organizationId: org.id } });
    return all.filter(isJoin).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  async decideJoinRequest(userEmail: string, id: string, dto: DecideJoinRequestDto) {
    const org = await this.orgForAdmin(userEmail);
    const request = await this.findOne(id);
    if (!isJoin(request) || request.organizationId !== org.id) {
      throw new ForbiddenException('This request was not sent to your organization');
    }
    if (!isPending(request.status)) throw new BadRequestException('This request has already been decided');

    const instructor = await this.instructorsRepo.findById(request.instructorId);
    if (!instructor) throw new NotFoundException('Instructor no longer exists');

    const approve = dto.action === 'approve';
    if (approve && this.isAffiliated(instructor) && instructor.organizationId !== org.id) {
      throw new BadRequestException(`${instructor.name} has since joined ${instructor.organizationName}`);
    }

    const updated = await this.requestsRepo.update(id, {
      status: approve ? JOIN_STATUS.APPROVED : JOIN_STATUS.REJECTED,
      decidedAt: new Date().toISOString(),
      orgNotes: dto.notes || null,
    });

    if (approve) await this.affiliate(instructor, org);

    await this.notifsRepo.create({
      title: approve ? `${org.name} approved your join request` : `${org.name} declined your join request`,
      desc: approve ? `You are now an instructor at ${org.name}.` : dto.notes || 'Your request to join was not approved.',
      time: 'Just now',
      category: 'Instructor',
      read: false,
      color: approve ? 'green' : 'amber',
      instructorId: instructor.id,
    });

    return updated;
  }
}
