import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

interface AuditBase {
  actorId: string;
  targetType: 'USER' | 'LISTING' | 'OFFER' | 'MESSAGE' | 'REPORT';
  targetId: string;
  ip?: string;
}

// Each variant enforces the right metadata shape for that action.
export type AuditLogEntry =
  | (AuditBase & { action: 'ADMIN_BAN_USER'; metadata: { status: string } })
  | (AuditBase & { action: 'ADMIN_UNBAN_USER'; metadata: { status: string } })
  | (AuditBase & { action: 'ADMIN_UPDATE_USER_STATUS'; metadata: { status: string } })
  | (AuditBase & { action: 'ADMIN_KYC_APPROVE'; metadata?: { reason?: string } })
  | (AuditBase & { action: 'ADMIN_KYC_REJECT'; metadata: { reason?: string } })
  | (AuditBase & { action: 'ADMIN_HIDE_LISTING'; metadata: { status: string } })
  | (AuditBase & { action: 'ADMIN_UPDATE_LISTING_STATUS'; metadata: { status: string } })
  | (AuditBase & { action: 'ADMIN_RESOLVE_REPORT'; metadata?: { resolution?: string } })
  | (AuditBase & { action: 'ADMIN_DELETE_LISTING'; metadata?: Record<string, never> })
  | (AuditBase & { action: 'ADMIN_DELETE_MESSAGE'; metadata?: Record<string, never> })
  | (AuditBase & { action: 'ADMIN_RESTORE_USER'; metadata?: Record<string, never> })
  | (AuditBase & { action: 'ADMIN_RESTORE_LISTING'; metadata?: Record<string, never> })
  | (AuditBase & { action: 'USER_DELETE_LISTING'; metadata?: Record<string, never> })
  | (AuditBase & { action: 'USER_CANCEL_OFFER'; metadata?: Record<string, never> })
  | (AuditBase & { action: 'LOGIN_SUSPICIOUS'; metadata?: Record<string, unknown> });

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
          meta: ((entry.metadata ?? {}) as Prisma.InputJsonValue),
        },
      });
    } catch (error) {
      console.error('[AuditService] Failed to log action:', error);
    }
  }
}
