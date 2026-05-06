import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { GetListingsQueryDto } from './dto/get-listings-query.dto';

type SearchResult = {
  items: any[];
  total: number;
};

@Injectable()
export class ListingSearchService {
  private readonly logger = new Logger(ListingSearchService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Sanitize a raw search string for use with plainto_tsquery.
   * Returns null if the sanitized result is empty.
   */
  buildSearchQuery(raw: string): string | null {
    const clean = raw
      .trim()
      .replace(/[&|!<>():*\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return clean.length > 0 ? clean : null;
  }

  /**
   * Full-text search via tsvector/tsquery, combined with optional filters.
   * Returns paginated items sorted by ts_rank DESC.
   */
  async fullTextSearch(
    sanitizedQ: string,
    q: GetListingsQueryDto,
    listingInclude: Prisma.ListingInclude,
    mapListings: (items: any[], userId?: string) => any[],
    userId?: string,
  ): Promise<SearchResult> {
    const skip = (q.page - 1) * q.limit;

    const conditions: Prisma.Sql[] = [
      Prisma.sql`l."searchVector" @@ plainto_tsquery('simple', ${sanitizedQ})`,
      Prisma.sql`l.status = ${'ACTIVE'}`,
      Prisma.sql`l."deletedAt" IS NULL`,
      Prisma.sql`u."deletedAt" IS NULL`,
    ];

    if (q.category) conditions.push(Prisma.sql`l.category = ${q.category}`);
    if (q.location)
      conditions.push(Prisma.sql`l.location ILIKE ${'%' + q.location + '%'}`);
    if (q.minPrice !== undefined)
      conditions.push(Prisma.sql`l.price >= ${q.minPrice}`);
    if (q.maxPrice !== undefined)
      conditions.push(Prisma.sql`l.price <= ${q.maxPrice}`);

    const whereClause = Prisma.join(conditions, ' AND ');

    const [rawRows, countResult] = await Promise.all([
      this.prisma.$queryRaw<Array<{ id: string; rank: number }>>`
        SELECT l.id, ts_rank(l."searchVector", plainto_tsquery('simple', ${sanitizedQ})) AS rank
        FROM "Listing" l
        JOIN "User" u ON u.id = l."userId"
        WHERE ${whereClause}
        ORDER BY rank DESC
        LIMIT ${q.limit} OFFSET ${skip}
      `,
      this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) AS count
        FROM "Listing" l
        JOIN "User" u ON u.id = l."userId"
        WHERE ${whereClause}
      `,
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const ids = rawRows.map((r) => r.id);
    const rankMap = new Map(rawRows.map((r) => [r.id, r.rank]));

    const data = await this.prisma.listing.findMany({
      where: { id: { in: ids } },
      include: listingInclude,
    });

    data.sort((a, b) => (rankMap.get(b.id) ?? 0) - (rankMap.get(a.id) ?? 0));

    return { items: mapListings(data, userId), total };
  }
}
