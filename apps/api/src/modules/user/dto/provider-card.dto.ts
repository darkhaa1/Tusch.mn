export type ProviderCardDto = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  location: string | null;
  topCategory: string | null;
  listingsCount: number;
  ratingAvg: number | null;
  reviewsCount: number;
};

export type ProvidersResponseDto = {
  items: ProviderCardDto[];
  total: number;
  page: number;
  limit: number;
};
