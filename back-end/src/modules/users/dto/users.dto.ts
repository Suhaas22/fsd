import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Dr. Sarah Jenkins' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'sarah.jenkins@university.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Instructor', enum: ['Student', 'Learner', 'Instructor', 'Educator', 'Organization', 'Admin'] })
  @IsString()
  role: string;

  @ApiPropertyOptional({ example: 'Active', enum: ['Active', 'Inactive', 'Suspended', 'Pending'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Verified', enum: ['Verified', 'Pending', 'Rejected'] })
  @IsOptional()
  @IsString()
  verificationStatus?: string;

  @ApiPropertyOptional({ example: 'Stanford University' })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  expertise?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Dr. Sarah Jenkins' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'sarah.jenkins@university.edu' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Instructor' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Verified' })
  @IsOptional()
  @IsString()
  verificationStatus?: string;

  @ApiPropertyOptional({ example: 'Stanford University' })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  expertise?: string;
}
