import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CourseModuleDto {
  @ApiPropertyOptional({ example: 'mod-1' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Distributed Consensus & Two-Phase Commit' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  lessons?: number;

  @ApiPropertyOptional({ example: '3h 15m' })
  @IsOptional()
  @IsString()
  duration?: string;
}

export class CourseInstructorAssignmentDto {
  @ApiProperty({ example: 'inst-1' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 'Prof. James Wilson' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Lead Instructor' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Cloud Architecture & AWS' })
  @IsOptional()
  @IsString()
  specialization?: string;
}

export class CreateCourseDto {
  @ApiProperty({ example: 'Advanced Enterprise Architecture & Payment Systems' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Cloud Architecture' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Advanced' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 'inst-1' })
  @IsOptional()
  @IsString()
  instructorId?: string;

  @ApiPropertyOptional({ example: ['inst-4'] })
  @IsOptional()
  @IsArray()
  coInstructorIds?: string[];

  @ApiPropertyOptional({ type: [CourseInstructorAssignmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseInstructorAssignmentDto)
  instructors?: CourseInstructorAssignmentDto[];

  @ApiPropertyOptional({ example: 89.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: 'Published' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({ example: 'Master distributed systems, consensus protocols, multi-region AWS deployments...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [CourseModuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseModuleDto)
  modules?: CourseModuleDto[];
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Advanced Enterprise Architecture & Payment Systems' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Cloud Architecture' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Advanced' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 'inst-1' })
  @IsOptional()
  @IsString()
  instructorId?: string;

  @ApiPropertyOptional({ example: ['inst-4'] })
  @IsOptional()
  @IsArray()
  coInstructorIds?: string[];

  @ApiPropertyOptional({ type: [CourseInstructorAssignmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseInstructorAssignmentDto)
  instructors?: CourseInstructorAssignmentDto[];

  @ApiPropertyOptional({ example: 89.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ example: 'Published' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiPropertyOptional({ example: 'Master distributed systems, consensus protocols...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [CourseModuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseModuleDto)
  modules?: CourseModuleDto[];

  @ApiPropertyOptional({ example: 4.9 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ example: 156 })
  @IsOptional()
  @IsNumber()
  enrolledCount?: number;

  @ApiPropertyOptional({ example: 15544 })
  @IsOptional()
  @IsNumber()
  revenue?: number;
}

export class CourseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by course category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by difficulty level (e.g. Beginner, Intermediate, Advanced)' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: 'Filter by status (e.g. Published, Draft, Archived)' })
  @IsOptional()
  @IsString()
  status?: string;
}
