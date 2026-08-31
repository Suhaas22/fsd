import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export enum DisputePriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum DisputeStatus {
  OPEN = 'Open',
  UNDER_REVIEW = 'Under Review',
  ESCALATED = 'Escalated',
  RESOLVED = 'Resolved',
}

export enum DisputeRole {
  ORGANIZATION = 'Organization',
  EDUCATOR = 'Educator',
  LEARNER = 'Learner',
}

export class CreateDisputeDto {
  @ApiProperty({ example: 'Prof. James Wilson' })
  @IsNotEmpty()
  @IsString()
  raisedBy: string;

  @ApiPropertyOptional({ example: 'inst-1' })
  @IsOptional()
  @IsString()
  raisedById?: string;

  @ApiPropertyOptional({ enum: DisputeRole, example: DisputeRole.EDUCATOR })
  @IsOptional()
  @IsEnum(DisputeRole)
  raisedByRole?: DisputeRole;

  @ApiProperty({ example: 'Royalty Payout Discrepancy' })
  @IsNotEmpty()
  @IsString()
  disputeType: string;

  @ApiProperty({ example: 'Q3 Co-instructor Royalty Split Discrepancy for AWS Module' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Discrepancy in revenue royalty calculation for Advanced Enterprise Architecture course.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Advanced Enterprise Architecture & Payment Systems' })
  @IsOptional()
  @IsString()
  courseTitle?: string;

  @ApiPropertyOptional({ example: 'crs-1' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ enum: DisputePriority, example: DisputePriority.HIGH })
  @IsOptional()
  @IsEnum(DisputePriority)
  priority?: DisputePriority;

  @ApiPropertyOptional({ example: 'Recalculate Q3 corporate cohort revenue and issue adjustment credit.' })
  @IsOptional()
  @IsString()
  desiredResolution?: string;
}

export class UpdateDisputeStatusDto {
  @ApiProperty({ enum: DisputeStatus, example: DisputeStatus.UNDER_REVIEW })
  @IsNotEmpty()
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @ApiPropertyOptional({ example: 'Dispute assigned to Senior Governance Council.' })
  @IsOptional()
  @IsString()
  adminNote?: string;
}

export class ResolveDisputeDto {
  @ApiProperty({ example: 'Credit adjustment approved and processed via finance settlement ledger.' })
  @IsNotEmpty()
  @IsString()
  resolutionNote: string;
}

export class DisputeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DisputeStatus, description: 'Filter by dispute status' })
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;

  @ApiPropertyOptional({ enum: DisputePriority, description: 'Filter by priority level' })
  @IsOptional()
  @IsEnum(DisputePriority)
  priority?: DisputePriority;
}
