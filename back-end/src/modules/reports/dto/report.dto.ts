import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export enum ReportType {
  ENROLLMENT_REPORT = 'Enrollment Report',
  FINANCIAL_REPORT = 'Financial Report',
  PERFORMANCE_REPORT = 'Performance Report',
  AUDIT_LOG = 'Audit Log',
}

export enum ReportFormat {
  CSV = 'CSV',
  JSON = 'JSON',
  PDF = 'PDF',
}

export class GenerateReportDto {
  @ApiProperty({ example: 'Q3 2026 Institutional Enrollment & Completion Audit' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Financial' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiPropertyOptional({ enum: ReportFormat, example: ReportFormat.CSV })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}

export class ReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by report type' })
  @IsOptional()
  @IsString()
  type?: string;
}
