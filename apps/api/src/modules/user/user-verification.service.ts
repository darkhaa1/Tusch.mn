import { Injectable, NotFoundException } from '@nestjs/common';
import { VerificationStatus } from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UserVerificationService {
  constructor(private prisma: PrismaService) {}

  async getVerificationStatus(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        verificationStatus: true,
        verificationRejectedReason: true,
        verifiedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      status: user.verificationStatus,
      rejectedReason: user.verificationRejectedReason,
      verifiedAt: user.verifiedAt,
    };
  }

  async submitVerification(userId: string, documentFilename: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: VerificationStatus.PENDING,
        verificationDocumentUrl: documentFilename,
        verificationRejectedReason: null,
      },
      select: { verificationStatus: true },
    });
    return { status: updated.verificationStatus };
  }
}
