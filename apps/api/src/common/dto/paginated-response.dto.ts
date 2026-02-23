import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ example: 120 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 12 })
  totalPages!: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data!: T[];

  @ApiProperty({ type: PaginationMeta })
  meta!: PaginationMeta;
}
