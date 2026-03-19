import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AdminRole } from '@repo/shared';

@Injectable()
export class ListingOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | { id: string; adminRole?: AdminRole }
      | undefined;
    const listingId = request.params.id as string;

    if (!user) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Non authentifié',
      });
    }

    // Admins and moderators bypass ownership check
    if (
      user.adminRole === AdminRole.ADMIN ||
      user.adminRole === AdminRole.MODERATOR
    ) {
      return true;
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });

    if (!listing) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Annonce introuvable',
      });
    }

    if (listing.userId !== user.id) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: "Accès refusé — vous n'êtes pas le propriétaire de cette annonce",
      });
    }

    return true;
  }
}

@Injectable()
export class OfferOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | { id: string; adminRole?: AdminRole }
      | undefined;
    const offerId = request.params.id as string;

    if (!user) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Non authentifié',
      });
    }

    // Admins and moderators bypass ownership check
    if (
      user.adminRole === AdminRole.ADMIN ||
      user.adminRole === AdminRole.MODERATOR
    ) {
      return true;
    }

    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      select: {
        providerId: true,
        listing: { select: { userId: true } },
      },
    });

    if (!offer) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Offre introuvable',
      });
    }

    // providerId = the service provider who submitted the offer
    // listing.userId = the client who posted the listing
    const isProvider = offer.providerId === user.id;
    const isClient = offer.listing.userId === user.id;

    if (!isProvider && !isClient) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: "Accès refusé — vous n'êtes pas concerné par cette offre",
      });
    }

    request.offerOwnership = { isProvider, isClient };
    return true;
  }
}
