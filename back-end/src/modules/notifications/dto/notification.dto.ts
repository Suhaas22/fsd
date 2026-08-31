import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateNotificationDto {
  @ApiProperty({ example: 'New Course Published' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Course has been verified and published to catalog.' })
  @IsNotEmpty()
  @IsString()
  desc: string;

  @ApiPropertyOptional({ example: 'Course' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'blue' })
  @IsOptional()
  @IsString()
  color?: string;
}

export class NotificationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter only unread notifications' })
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter by category (e.g. Instructor, Course, Financial, Dispute)' })
  @IsOptional()
  @IsString()
  category?: string;
}
