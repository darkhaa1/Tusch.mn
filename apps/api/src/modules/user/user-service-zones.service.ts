import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MN_CITY_SET, MN_DISTRICT_MAP } from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UserServiceZonesService {
  constructor(private prisma: PrismaService) {}

  async updateServiceZones(
    userId: string,
    zones: { city: string; district?: string }[],
  ) {
    for (const zone of zones) {
      if (!MN_CITY_SET.has(zone.city)) {
        throw new BadRequestException(
          `City "${zone.city}" is not in the reference list`,
        );
      }
      if (zone.district) {
        const districtSet = MN_DISTRICT_MAP.get(zone.city);
        if (!districtSet || !districtSet.has(zone.district)) {
          throw new BadRequestException(
            `District "${zone.district}" is not valid for city "${zone.city}"`,
          );
        }
      }
    }

    await this.prisma.$transaction([
      this.prisma.serviceZone.deleteMany({ where: { userId } }),
      this.prisma.serviceZone.createMany({
        data: zones.map((z) => ({
          userId,
          city: z.city,
          district: z.district ?? null,
        })),
      }),
    ]);

    return this.prisma.serviceZone.findMany({
      where: { userId },
      orderBy: [{ city: 'asc' }, { district: 'asc' }],
    });
  }

  async getServiceZones(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.serviceZone.findMany({
      where: { userId },
      orderBy: [{ city: 'asc' }, { district: 'asc' }],
    });
  }
}
