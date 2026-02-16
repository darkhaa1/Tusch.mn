import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserStatus } from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id ?? request.user?.sub;

    if (!userId) {
      throw new ForbiddenException('Forbidden');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, status: true },
    });

    if (!user || !user.isAdmin || user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Forbidden');
    }

    return true;
  }
}
