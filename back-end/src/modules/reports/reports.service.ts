import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORY_TOKENS } from '../../database/database.module';
import { JsonRepository } from '../../database/json-repository';
import { GenerateReportDto, ReportFormat, ReportQueryDto, ReportType } from './dto/report.dto';
import { QueryFilter } from '../../database/interfaces/database.interface';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPOSITORY_TOKENS.REPORTS)
    private readonly reportsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.ENROLLMENTS)
    private readonly enrollmentsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONS)
    private readonly transactionsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.COURSES)
    private readonly coursesRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.INSTRUCTORS)
    private readonly instructorsRepo: JsonRepository<any>,
    @Inject(REPOSITORY_TOKENS.DISPUTES)
    private readonly disputesRepo: JsonRepository<any>
  ) {}

  async findAll(query: ReportQueryDto) {
    const { page = 1, limit = 10, search, type, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const where: QueryFilter<any> = {};
    if (type) where.type = type;

    if (search) {
      where.$or = [
        { title: { $contains: search } },
        { type: { $contains: search } },
        { format: { $contains: search } },
      ];
    }

    return this.reportsRepo.findAndCount({
      where,
      skip,
      limit,
      sort: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string) {
    const report = await this.reportsRepo.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID '${id}' not found`);
    }
    return report;
  }

  async generate(dto: GenerateReportDto) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const nowIso = now.toISOString();
    const newId = `rep-${Date.now()}`;
    const format = dto.format || ReportFormat.CSV;

    const newReport = await this.reportsRepo.create({
      id: newId,
      title: dto.title,
      type: dto.type,
      date: dateStr,
      size: '3.6 MB',
      format: format === ReportFormat.CSV ? 'CSV / XLSX' : format,
      createdAt: nowIso,
    });

    return newReport;
  }

  async exportReportData(id: string) {
    const report = await this.findOne(id);

    let csvContent = '';
    let dataset: any[] = [];

    switch (report.type) {
      case ReportType.ENROLLMENT_REPORT: {
        const enrollments = await this.enrollmentsRepo.find();
        dataset = enrollments;
        csvContent = 'Enrollment ID,Learner Name,Course Title,Enrolled Date,Progress,Status\n';
        enrollments.forEach((e) => {
          csvContent += `"${e.id}","${e.learnerName}","${e.courseTitle}","${e.enrolledDate}","${e.progress}%","${e.status}"\n`;
        });
        break;
      }
      case ReportType.FINANCIAL_REPORT: {
        const transactions = await this.transactionsRepo.find();
        dataset = transactions;
        csvContent = 'Transaction ID,Type,Payer,Course/Purpose,Amount,Payment Method,Date,Status\n';
        transactions.forEach((t) => {
          csvContent += `"${t.id}","${t.type}","${t.payer}","${t.course}","${t.amount}","${t.method}","${t.date}","${t.status}"\n`;
        });
        break;
      }
      case ReportType.PERFORMANCE_REPORT: {
        const courses = await this.coursesRepo.find();
        dataset = courses;
        csvContent = 'Course ID,Title,Category,Level,Instructors,Price,Enrolled Count,Rating,Status\n';
        courses.forEach((c) => {
          csvContent += `"${c.id}","${c.title}","${c.category}","${c.level}","${c.instructorName}","${c.price}","${c.enrolledCount}","${c.rating}","${c.status}"\n`;
        });
        break;
      }
      case ReportType.AUDIT_LOG:
      default: {
        const disputes = await this.disputesRepo.find();
        dataset = disputes;
        csvContent = 'Dispute ID,Raised By,Role,Type,Subject,Priority,Status,Created At,Resolved At\n';
        disputes.forEach((d) => {
          csvContent += `"${d.id}","${d.raisedBy}","${d.raisedByRole}","${d.disputeType}","${d.subject}","${d.priority}","${d.status}","${d.createdAt}","${d.resolvedAt || 'N/A'}"\n`;
        });
        break;
      }
    }

    return {
      reportId: report.id,
      title: report.title,
      type: report.type,
      generatedDate: report.date,
      recordCount: dataset.length,
      csvContent,
      dataset,
    };
  }

  async delete(id: string) {
    const report = await this.reportsRepo.findById(id);
    if (!report) {
      throw new NotFoundException(`Report with ID '${id}' not found`);
    }
    return this.reportsRepo.delete(id);
  }
}
