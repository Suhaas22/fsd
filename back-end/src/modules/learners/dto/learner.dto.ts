import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateLearnerDto {
  @ApiProperty({ example: 'Alex Chen' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'alex.chen@stanford.edu' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Student' })
  @IsOptional()
  @IsString()
  learnerType?: string;

  @ApiPropertyOptional({ example: 'Stanford University' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'January 2026' })
  @IsOptional()
  @IsString()
  joinedDate?: string;
}

export class UpdateLearnerDto {
  @ApiPropertyOptional({ example: 'Alex Chen' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'alex.chen@stanford.edu' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Professional' })
  @IsOptional()
  @IsString()
  learnerType?: string;

  @ApiPropertyOptional({ example: 'FinTech Alliance' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  enrolledCourses?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  completedCourses?: number;

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  @IsNumber()
  overallProgress?: number;

  @ApiPropertyOptional({ example: '88%' })
  @IsOptional()
  @IsString()
  avgScore?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  certificatesCount?: number;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 359.96 })
  @IsOptional()
  @IsNumber()
  totalSpent?: number;
}

export class LearnerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by learner type (e.g. Student, Professional)' })
  @IsOptional()
  @IsString()
  learnerType?: string;

  @ApiPropertyOptional({ description: 'Filter by status (e.g. Active, Completed, Inactive)' })
  @IsOptional()
  @IsString()
  status?: string;
}
