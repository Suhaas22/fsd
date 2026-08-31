import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'sarah.jenkins@university.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: 'Instructor', enum: ['Student', 'Instructor', 'Organization', 'Admin'] })
  @IsOptional()
  @IsString()
  role?: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Alex Johnson' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alex.johnson@stanford.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Student', enum: ['Student', 'Instructor', 'Organization', 'Admin'] })
  @IsString()
  role: 'Student' | 'Instructor' | 'Organization' | 'Admin';

  @ApiPropertyOptional({ example: 'Stanford University' })
  @IsOptional()
  @IsString()
  university?: string;

  @ApiPropertyOptional({ example: 'Computer Science & Full-stack' })
  @IsOptional()
  @IsString()
  expertise?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'NewSecretPass456!' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
