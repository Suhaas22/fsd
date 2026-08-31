import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseEnvelope<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2026-08-30T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'Operation completed successfully', required: false })
  message?: string;
}

export class PaginatedResponseEnvelope<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  @ApiProperty({ example: '2026-08-30T10:00:00.000Z' })
  timestamp: string;
}
