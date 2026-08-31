import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import {
  CreateDisputeDto,
  DisputeQueryDto,
  DisputeRole,
  DisputeStatus,
  ResolveDisputeDto,
  UpdateDisputeStatusDto,
} from './dto/dispute.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class DisputesService {
  constructor(
    @Inject(REPOSITORY_TOKENS.DISPUTES)
    private readonly disputesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.NOTIFICATIONS)
    private readonly notifsRepo: JsonRepository<any>
  ) {}

  async findAll(query: DisputeQueryDto) {
    const { page = 1, limit = 10, search, status, priority, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};

    if (status && (status as any) !== 'All') where.status = status;
    if (priority && (priority as any) !== 'All') where.priority = priority;

    if (search) {
      where.$or = [
        { id: { $contains: search } },
        { subject: { $contains: search } },
        { raisedBy: { $contains: search } },
        { disputeType: { $contains: search } },
        { courseTitle: { $contains: search } },
      ];
    }

    return this.disputesRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string) {
    const dispute = await this.disputesRepo.findById(id);
    if (!dispute) {
      throw new NotFoundException(`Dispute ticket with ID '${id}' not found`);
    }
    return dispute;
  }

  async create(dto: CreateDisputeDto) {
    const year = new Date().getFullYear();
    const newId = `DSP-${year}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const dispute = await this.disputesRepo.create({
      id: newId,
      raisedBy: dto.raisedBy,
      raisedById: dto.raisedById || 'org-101',
      raisedByRole: dto.raisedByRole || DisputeRole.ORGANIZATION,
      disputeType: dto.disputeType,
      subject: dto.subject,
      description: dto.description,
      courseTitle: dto.courseTitle || '',
      courseId: dto.courseId || '',
      priority: dto.priority || 'Medium',
      status: DisputeStatus.OPEN,
      createdAt: nowIso,
      resolvedAt: null,
      adminNotes: 'Ticket created and dispatched to Governance and Academic Council.',
      desiredResolution: dto.desiredResolution || 'Prompt review and resolution by administration.',
    });

    await this.notifsRepo.create({
      title: `New Dispute Ticket Raised: ${newId}`,
      desc: `Dispute regarding "${dispute.subject}" was logged by ${dispute.raisedBy}.`,
      time: 'Just now',
      category: 'Dispute',
      read: false,
      color: 'purple',
    });

    return dispute;
  }

  async updateStatus(id: string, dto: UpdateDisputeStatusDto) {
    const dispute = await this.disputesRepo.findById(id);
    if (!dispute) {
      throw new NotFoundException(`Dispute ticket with ID '${id}' not found`);
    }

    const isResolved = dto.status === DisputeStatus.RESOLVED;
    const nowIso = new Date().toISOString();

    return this.disputesRepo.update(id, {
      status: dto.status,
      resolvedAt: isResolved ? nowIso : dispute.resolvedAt,
      adminNotes: dto.adminNote
        ? `${dispute.adminNotes || ''} • ${dto.adminNote}`
        : dispute.adminNotes,
    });
  }

  async resolve(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.disputesRepo.findById(id);
    if (!dispute) {
      throw new NotFoundException(`Dispute ticket with ID '${id}' not found`);
    }

    const nowIso = new Date().toISOString();

    const updated = await this.disputesRepo.update(id, {
      status: DisputeStatus.RESOLVED,
      resolvedAt: nowIso,
      adminNotes: `${dispute.adminNotes || ''} • Resolution: ${dto.resolutionNote}`,
    });

    await this.notifsRepo.create({
      title: `Dispute Resolved: ${dispute.id}`,
      desc: `Ticket "${dispute.subject}" has been marked as Resolved by administration.`,
      time: 'Just now',
      category: 'Dispute',
      read: false,
      color: 'green',
    });

    return updated;
  }

  async delete(id: string) {
    const dispute = await this.disputesRepo.findById(id);
    if (!dispute) {
      throw new NotFoundException(`Dispute ticket with ID '${id}' not found`);
    }
    return this.disputesRepo.delete(id);
  }
}
