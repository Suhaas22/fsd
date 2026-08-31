import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class AssignmentsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.ASSIGNMENTS)
    private readonly assignmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.SUBMISSIONS)
    private readonly submissionsRepo: JsonRepository<any>
  ) {}

  async findAll() {
    return this.assignmentsRepo.find();
  }

  async findOne(id: string) {
    const asg = await this.assignmentsRepo.findById(id);
    if (!asg) {
      throw new NotFoundException(`Assignment '${id}' not found`);
    }
    asg.submissions = await this.submissionsRepo.find({ where: { assignmentId: id } });
    return asg;
  }

  async findByCourse(courseId: string) {
    return this.assignmentsRepo.find({ where: { courseId } });
  }

  async create(data: any) {
    return this.assignmentsRepo.create({
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...data,
    });
  }

  async submit(assignmentId: string, data: any) {
    const asg = await this.assignmentsRepo.findById(assignmentId);
    if (!asg) {
      throw new NotFoundException(`Assignment '${assignmentId}' not found`);
    }
    return this.submissionsRepo.create({
      id: `sub-${Date.now()}`,
      assignmentId,
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      ...data,
    });
  }

  async gradeSubmission(submissionId: string, score: number, feedback: string) {
    const updated = await this.submissionsRepo.update(submissionId, {
      score,
      feedback,
      status: 'Graded',
    });
    if (!updated) {
      throw new NotFoundException(`Submission '${submissionId}' not found`);
    }
    return updated;
  }
}
