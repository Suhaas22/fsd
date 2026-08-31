import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({ example: 'crs-101' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: 'AWS Solutions Architecture Quiz' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Knowledge check on VPCs and networking' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  @IsNumber()
  passingScore?: number;
}

export class SubmitQuizDto {
  @ApiProperty({ example: { 'qst-1': 'B', 'qst-2': 'B' } })
  @IsNotEmpty()
  answers: Record<string, string>;
}

export class CreateQuizQuestionDto {
  @ApiProperty({ example: 'qiz-1' })
  @IsString()
  @IsNotEmpty()
  quizId: string;

  @ApiProperty({ example: 'Which AWS service is used for DNS routing?' })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({ example: 'Route 53' })
  @IsString()
  optionA: string;

  @ApiProperty({ example: 'CloudFront' })
  @IsString()
  optionB: string;

  @ApiProperty({ example: 'Direct Connect' })
  @IsString()
  optionC: string;

  @ApiProperty({ example: 'VPC' })
  @IsString()
  optionD: string;

  @ApiProperty({ example: 'A', enum: ['A', 'B', 'C', 'D'] })
  @IsString()
  correctOption: 'A' | 'B' | 'C' | 'D';

  @ApiPropertyOptional({ example: 'Route 53 is AWS DNS service.' })
  @IsOptional()
  @IsString()
  explanation?: string;
}
