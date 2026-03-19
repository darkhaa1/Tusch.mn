// Common JWT guard re-exported for controllers
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminRole } from '@repo/shared';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.accessToken;

    if (!token) throw new UnauthorizedException('No token');

    try {
      const decoded = this.jwtService.verify<{
        sub: string;
        email: string;
        adminRole?: AdminRole;
      }>(token);
      request.user = {
        id: decoded.sub,
        email: decoded.email,
        adminRole: decoded.adminRole ?? AdminRole.USER,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
