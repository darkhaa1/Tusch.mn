import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ReportStatus,
  ReportTargetType,
  UserStatus,
} from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { GetAdminReportsQueryDto } from './dto/get-admin-reports-query.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private async ensureAdmin(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { isAdmin: true, status: true },
    });

    if (!user || !user.isAdmin || user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Forbidden');
    }
  }

  private async validateTarget(
    reporterId: string,
    targetType: ReportTargetType,
    targetId: string,
  ) {
    if (targetType === ReportTargetType.LISTING) {
      const listing = await this.prisma.listing.findFirst({
        where: { id: targetId, deletedAt: null, user: { deletedAt: null } },
        select: { id: true, userId: true },
      });
      if (!listing) {
        throw new NotFoundException('Listing not found');
      }
      if (listing.userId === reporterId) {
        throw new BadRequestException('Cannot report your own listing');
      }
      return;
    }

    const user = await this.prisma.user.findFirst({
      where: { id: targetId, deletedAt: null },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.id === reporterId) {
      throw new BadRequestException('Cannot report yourself');
    }
  }

  async create(dto: CreateReportDto, reporterId: string) {
    await this.validateTarget(reporterId, dto.targetType, dto.targetId);

    const duplicate = await this.prisma.report.findFirst({
      where: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        status: ReportStatus.PENDING,
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException('Active report already exists');
    }

    return this.prisma.report.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
        description: dto.description?.trim() || null,
      },
    });
  }

  async findAllAdmin(adminId: string, query: GetAdminReportsQueryDto) {
    await this.ensureAdmin(adminId);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.targetType ? { targetType: query.targetType } : {}),
    };

    const [reports, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    const listingIds = reports
      .filter((item) => item.targetType === ReportTargetType.LISTING)
      .map((item) => item.targetId);
    const userIds = reports
      .filter((item) => item.targetType === ReportTargetType.USER)
      .map((item) => item.targetId);

    const [listings, users] = await Promise.all([
      listingIds.length
        ? this.prisma.listing.findMany({
            where: { id: { in: listingIds } },
            select: {
              id: true,
              description: true,
              status: true,
              deletedAt: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          })
        : Promise.resolve([]),
      userIds.length
        ? this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              status: true,
              deletedAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const listingMap = new Map(listings.map((item) => [item.id, item]));
    const userMap = new Map(users.map((item) => [item.id, item]));

    const items = reports.map((report) => {
      const target =
        report.targetType === ReportTargetType.LISTING
          ? listingMap.get(report.targetId) || null
          : userMap.get(report.targetId) || null;
      return { ...report, target };
    });

    return { items, total, page, limit };
  }

  async updateStatus(
    adminId: string,
    reportId: string,
    dto: UpdateReportStatusDto,
  ) {
    await this.ensureAdmin(adminId);

    const existing = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Report not found');
    }

    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });
  }
}
