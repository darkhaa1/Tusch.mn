import { Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

@Injectable()
export class ThrottleByUserGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = (req as Record<string, any> & { user?: { id: string } }).user
    if (user?.id) return `user:${user.id}`
    const forwarded = req.headers['x-forwarded-for'] as string | string[] | undefined
    const ip = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded?.split(',')[0]?.trim() ?? (req.ip as string | undefined) ?? 'unknown'
    return ip
  }
}
