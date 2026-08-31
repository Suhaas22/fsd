import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export enum EnrollmentStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  DROPPED = 'Dropped',
}

export class AssignCoursesToLearnersDto {
  @ApiProperty({ example: ['crs-1', 'crs-2'], description: 'List of course IDs to assign' })
  @IsNotEmpty()
  @IsArray()
  courseIds: string[];

  @ApiProperty({ example: ['lrn-1', 'lrn-2'], description: 'List of learner IDs to enroll' })
  @IsNotEmpty()
  @IsArray()
  learnerIds: string[];
}

export class UpdateEnrollmentProgressDto {
  @ApiProperty({ example: 75, minimum: 0, maximum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;
}

export class UpdateEnrollmentStatusDto {
  @ApiProperty({ enum: EnrollmentStatus, example: EnrollmentStatus.COMPLETED })
  @IsNotEmpty()
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}

export class EnrollmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by learner ID' })
  @IsOptional()
  @IsString()
  learnerId?: string;

  @ApiPropertyOptional({ description: 'Filter by course ID' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Filter by enrollment status' })
  @IsOptional()
  @IsString()
  status?: string;
}
