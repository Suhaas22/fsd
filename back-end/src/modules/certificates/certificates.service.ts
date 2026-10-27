import {enrollmentLearning} from '../../common/learning/learning-records';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';

@Injectable()
export class CertificatesService {
  constructor(
    @Inject(REPOSITORY_TOKENS.CERTIFICATES)
    private readonly certificatesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.LEARNERS) private readonly learnersRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS) private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES) private readonly coursesRepo: JsonRepository<any>
  ) {}

  private async completed(cert:any){
    const learner=await this.learnersRepo.findById(cert.learnerId);
    const course=await this.coursesRepo.findById(cert.courseId);
    if(!learner||!course)return false;
    const enrollment=(await this.enrollmentsRepo.find()).find(e=>[learner.id,learner.userId].filter(Boolean).includes(e.learnerId)&&e.courseId===course.id);
    if(!enrollment)return false;
    const normalized=enrollmentLearning(course,enrollment);
    return normalized.status==='Completed'&&Number(normalized.progress)===100;
  }

  private async enrich(cert: any) {
    const learner = cert.learnerId ? await this.learnersRepo.findById(cert.learnerId) : null;
    const learnerName = learner?.name || cert.learnerName || cert.learner || '';
    return { ...cert, learnerName, learner: learnerName,
      learnerEmail: learner?.email || cert.learnerEmail || '',
      courseTitle: cert.courseTitle || cert.course || '', course: cert.courseTitle || cert.course || '' };
  }

  async findAll() {
    const rows=await this.certificatesRepo.find();const eligible=await Promise.all(rows.map(cert=>this.completed(cert)));return Promise.all(rows.filter((_,i)=>eligible[i]).map(cert=>this.enrich(cert)));
  }

  async findOne(id: string) {
    const cert = await this.certificatesRepo.findById(id) || await this.certificatesRepo.findOne({ credentialId: id });
    if (!cert||!await this.completed(cert)) throw new NotFoundException(`Certificate '${id}' not found`);
    return this.enrich(cert);
  }

  async verify(credentialId: string) {
    const cert = await this.certificatesRepo.findOne({ credentialId }) || await this.certificatesRepo.findById(credentialId);
    if (!cert||!await this.completed(cert)) {
      throw new NotFoundException(`Credential ID '${credentialId}' not found on public ledger`);
    }
    return {
      verified: true,
      certificate: await this.enrich(cert),
      verificationTimestamp: new Date().toISOString(),
    };
  }

  async create(data: any) {
    if(!await this.completed(data))throw new BadRequestException('Complete the enrolled course before issuing a certificate.');
    const existing=await this.certificatesRepo.findOne({learnerId:data.learnerId,courseId:data.courseId});if(existing)return this.enrich(existing);
    return this.certificatesRepo.create({
      id: `cert-${Date.now()}`,
      issuedAt: new Date().toISOString(),
      status: 'Verified',
      ...data,
    });
  }
}
