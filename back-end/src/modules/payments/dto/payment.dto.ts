import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export enum TransactionType {
  PAYMENT = 'Payment',
  PAYOUT = 'Payout',
  REFUND = 'Refund',
}

export enum TransactionStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  FAILED = 'Failed',
}

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.PAYMENT })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 'Alex Chen' })
  @IsNotEmpty()
  @IsString()
  payer: string;

  @ApiProperty({ example: 'Advanced Enterprise Architecture & Payment Systems' })
  @IsNotEmpty()
  @IsString()
  course: string;

  @ApiProperty({ example: 89.99 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'Visa •••• 4242' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ enum: TransactionStatus, example: TransactionStatus.COMPLETED })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}

export class TransactionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TransactionType, description: 'Filter by transaction type' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ enum: TransactionStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
