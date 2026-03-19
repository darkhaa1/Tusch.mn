import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export type AuditAction =
  | 'ADMIN_BAN_USER'
  | 'ADMIN_UNBAN_USER'
  | 'ADMIN_DELETE_LISTING'
  | 'ADMIN_HIDE_LISTING'
  | 'ADMIN_RESOLVE_REPORT'
  | 'ADMIN_DELETE_MESSAGE'
  | 'ADMIN_RESTORE_USER'
  | 'ADMIN_RESTORE_LISTING'
  | 'ADMIN_UPDATE_USER_STATUS'
  | 'ADMIN_UPDATE_LISTING_STATUS'
  | 'USER_DELETE_LISTING'
  | 'USER_CANCEL_OFFER'
  | 'LOGIN_SUSPICIOUS';

export interface AuditLogEntry {
  actorId: string;
  action: AuditAction;
  targetType: 'USER' | 'LISTING' | 'OFFER' | 'MESSAGE' | 'REPORT';
  targetId: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.adminActionLog.create({
        data: {
          adminId: entry.actorId,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId,
          meta: (entry.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      console.error('[AuditService] Failed to log action:', error);
    }
  }
}
