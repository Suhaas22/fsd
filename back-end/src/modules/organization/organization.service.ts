import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @Inject(REPOSITORY_TOKENS.ORGANIZATION)
    private readonly orgRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS)
    private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTOR_REQUESTS)
    private readonly requestsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.DISPUTES)
    private readonly disputesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>
  ) {}

  async getProfile() {
    const orgs = await this.orgRepo.find();
    if (orgs.length === 0) {
      throw new NotFoundException('Organization details not found');
    }
    return orgs[0];
  }

  async updateProfile(dto: UpdateOrganizationDto) {
    const orgs = await this.orgRepo.find();
    if (orgs.length === 0) {
      return this.orgRepo.create(dto as any);
    }
    return this.orgRepo.update(orgs[0].id, dto);
  }

  async getStats() {
    const [
      totalInstructors,
      totalLearners,
      courses,
      enrollments,
      pendingRequests,
      openDisputes,
      unreadNotifs,
    ] = await Promise.all([
      this.instructorsRepo.count(),
      this.learnersRepo.count(),
      this.coursesRepo.find(),
      this.enrollmentsRepo.find(),
      this.requestsRepo.count({
        status: { $regex: /pending|sent/i },
      }),
      this.disputesRepo.count({
        status: { $ne: 'Resolved' },
      }),
      this.notifsRepo.count({ read: false }),
    ]);

    const activeCourses = courses.filter((c) => c.status === 'Published').length;
    const annualRevenue = courses.reduce(
      (sum, c) => sum + (c.revenue || c.price * (c.enrolledCount || 10)),
      0
    );
    const monthlyRevenue = Math.round(annualRevenue * 0.3);

    const completedEnrollments = enrollments.filter(
      (e) => e.status === 'Completed' || e.progress === 100
    ).length;
    const activeEnrollments = enrollments.filter(
      (e) => e.status === 'Active' && e.progress < 100
    ).length;

    const completionRate =
      enrollments.length > 0
        ? Math.round((completedEnrollments / enrollments.length) * 100)
        : 72;

    const ratingsSum = courses.reduce((sum, c) => sum + (c.rating || 4.8), 0);
    const averageRating =
      courses.length > 0 ? Number((ratingsSum / courses.length).toFixed(1)) : 4.8;

    return {
      totalInstructors,
      totalLearners,
      activeCourses,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      activeEnrollments,
      completedEnrollments,
      pendingRequests,
      openDisputes,
      unreadNotifications: unreadNotifs,
      annualRevenue,
      monthlyRevenue,
      completionRate,
      averageRating,
      currency: 'USD',
    };
  }

  async findAllOrgs() {
    const [orgs, allInstructors] = await Promise.all([
      this.orgRepo.find(),
      this.instructorsRepo.find(),
    ]);

    return orgs.map((org) => {
      // Match instructors belonging to this organization
      const associatedInstructors = allInstructors.filter((inst) => {
        if (org.instructorIds && Array.isArray(org.instructorIds)) {
          if (org.instructorIds.includes(inst.id)) return true;
        }
        if (org.name && inst.bio && inst.bio.toLowerCase().includes(org.name.toLowerCase())) return true;
        if (org.email && inst.email) {
          const orgDomain = org.email.split('@')[1];
          const instDomain = inst.email.split('@')[1];
          if (orgDomain && instDomain && orgDomain === instDomain) return true;
        }
        return false;
      });

      const grossRevenue = Number(org.totalRevenue) || 100000;
      const orgShare85 = Math.round(grossRevenue * 0.85);
      const superAdminShare15 = Math.round(grossRevenue * 0.15);

      return {
        ...org,
        instructors: associatedInstructors,
        instructorsCount: associatedInstructors.length || (org.instructorIds ? org.instructorIds.length : 1),
        financials: {
          grossRevenue,
          orgShare85,
          superAdminShare15,
          orgPercentage: 85,
          superAdminPercentage: 15,
          currency: org.currency || 'USD',
        },
      };
    });
  }

  async findOrgById(id: string) {
    const org = await this.orgRepo.findById(id);
    if (!org) {
      const allOrgs = await this.orgRepo.find();
      const match = allOrgs.find((o) => o.id === id);
      if (!match) throw new NotFoundException(`Organization with ID '${id}' not found`);
      return match;
    }
    const allInstructors = await this.instructorsRepo.find();
    const associatedInstructors = allInstructors.filter((inst) =>
      org.instructorIds?.includes(inst.id)
    );
    const grossRevenue = Number(org.totalRevenue) || 100000;
    return {
      ...org,
      instructors: associatedInstructors,
      financials: {
        grossRevenue,
        orgShare85: Math.round(grossRevenue * 0.85),
        superAdminShare15: Math.round(grossRevenue * 0.15),
        orgPercentage: 85,
        superAdminPercentage: 15,
        currency: org.currency || 'USD',
      },
    };
  }

  async createOrg(dto: any) {
    const newId = `org-${Date.now().toString().slice(-4)}`;
    const newOrg = await this.orgRepo.create({
      id: newId,
      name: dto.name || 'New University Partner',
      tagline: dto.tagline || 'Leading Academic Institution',
      email: dto.email || `contact@${newId}.edu`,
      phone: dto.phone || '+1 (555) 019-2831',
      location: dto.location || 'Global Campus',
      address: dto.address || 'Campus Quad, Academic Wing',
      website: dto.website || `https://${newId}.edu`,
      status: dto.status || 'Active',
      establishedYear: dto.establishedYear || new Date().getFullYear(),
      totalRevenue: Number(dto.totalRevenue) || 50000,
      monthlyRevenue: Math.round((Number(dto.totalRevenue) || 50000) * 0.3),
      currency: dto.currency || 'USD',
      instructorIds: dto.instructorIds || ['inst-1'],
      coursesCount: dto.coursesCount || 2,
      learnersCount: dto.learnersCount || 100,
      logo: dto.logo || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return newOrg;
  }

  async updateOrg(id: string, dto: any) {
    const existing = await this.orgRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Organization with ID '${id}' not found`);
    }
    const updated = await this.orgRepo.update(id, {
      ...dto,
      updatedAt: new Date().toISOString(),
    });
    return updated;
  }

  async deleteOrg(id: string) {
    const existing = await this.orgRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Organization with ID '${id}' not found`);
    }
    await this.orgRepo.delete(id);
    return { success: true, message: `Organization '${id}' removed` };
  }

  async getStudentJoinRequests() {
    const learners = await this.learnersRepo.find();
    return learners.filter(
      (l) => l.orgMembershipStatus === 'Pending Organization Approval' || l.requestedOrgName
    );
  }

  async respondStudentJoinRequest(learnerId: string, action: 'approve' | 'reject') {
    const learner = await this.learnersRepo.findById(learnerId);
    if (!learner) {
      throw new NotFoundException(`Learner '${learnerId}' not found`);
    }

    const isApprove = action === 'approve';
    const updated = await this.learnersRepo.update(learnerId, {
      orgMembershipStatus: isApprove ? 'Verified Student' : 'Independent Learner',
      university: isApprove ? (learner.requestedOrgName || 'Stanford University') : 'Independent Learner',
      learnerType: isApprove ? 'Student' : 'Learner',
      status: isApprove ? 'Active Student' : 'Active Learner',
      requestedOrgId: null,
      requestedOrgName: null,
    });

    return updated;
  }
}

