import { ApiProperty } from '@nestjs/swagger';

export class ProviderCardDto {
  @ApiProperty({ example: 'usr_1' })
  id!: string;

  @ApiProperty({ example: 'Bataa' })
  firstName!: string;

  @ApiProperty({ example: 'Enkh' })
  lastName!: string;

  @ApiProperty({ nullable: true, example: null })
  avatarUrl!: string | null;

  @ApiProperty({ nullable: true, example: 'UB' })
  location!: string | null;

  @ApiProperty({ nullable: true, example: 'tutoring' })
  topCategory!: string | null;

  @ApiProperty({ example: 3 })
  listingsCount!: number;

  @ApiProperty({ nullable: true, example: 4.8 })
  ratingAvg!: number | null;

  @ApiProperty({ example: 12 })
  reviewsCount!: number;

  @ApiProperty({ example: 5 })
  favoritesCount!: number;

  @ApiProperty({ example: false })
  isFavorited!: boolean;
}

export class ProvidersResponseDto {
  @ApiProperty({ type: [ProviderCardDto] })
  items!: ProviderCardDto[];

  @ApiProperty({ example: 10 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 12 })
  limit!: number;
}
