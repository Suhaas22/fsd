import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateInstructorDto {
  @ApiProperty({ example: 'Prof. James Wilson' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'j.wilson@nexuspay.edu' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Senior Principal Instructor' })
  @IsOptional()
  @IsString()
  educatorType?: string;

  @ApiProperty({ example: 'Cloud Architecture & AWS' })
  @IsNotEmpty()
  @IsString()
  specialization: string;

  @ApiPropertyOptional({ example: ['AWS', 'Cloud Architecture', 'Distributed Systems'] })
  @IsOptional()
  @IsArray()
  expertise?: string[];

  @ApiPropertyOptional({ example: 'Former Principal Cloud Architect at AWS with 14+ years designing transaction engines.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 4.8 })
  @IsOptional()
  @IsNumber()
  avgRating?: number;

  @ApiPropertyOptional({ example: 'January 2023' })
  @IsOptional()
  @IsString()
  joinedDate?: string;
}

export class UpdateInstructorDto {
  @ApiPropertyOptional({ example: 'Prof. James Wilson' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'j.wilson@nexuspay.edu' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Senior Principal Instructor' })
  @IsOptional()
  @IsString()
  educatorType?: string;

  @ApiPropertyOptional({ example: 'Cloud Architecture & AWS' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: ['AWS', 'Cloud Architecture', 'Distributed Systems'] })
  @IsOptional()
  @IsArray()
  expertise?: string[];

  @ApiPropertyOptional({ example: 'Former Principal Cloud Architect at AWS with 14+ years designing transaction engines.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  coursesCount?: number;

  @ApiPropertyOptional({ example: 342 })
  @IsOptional()
  @IsNumber()
  enrolledStudents?: number;

  @ApiPropertyOptional({ example: 4.8 })
  @IsOptional()
  @IsNumber()
  avgRating?: number;

  @ApiPropertyOptional({ example: 28400 })
  @IsOptional()
  @IsNumber()
  revenueGenerated?: number;

  @ApiPropertyOptional({ example: 'January 2023' })
  @IsOptional()
  @IsString()
  joinedDate?: string;
}

export class InstructorQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by specialization substring' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ description: 'Filter by status (e.g. Active, Inactive)' })
  @IsOptional()
  @IsString()
  status?: string;
}
