import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AdminRole } from '@repo/shared';

function cookieExtractor(req: Request): string | null {
  return req?.cookies?.accessToken ?? null; // <-- le nom de TON cookie
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(), // fallback si besoin
      ]),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // payload attendu: { sub: userId, email, adminRole? }
    if (!payload?.sub) throw new UnauthorizedException('Invalid token');
    return {
      id: payload.sub,
      email: payload.email,
      adminRole: (payload.adminRole as AdminRole) ?? AdminRole.USER,
    }; // devient req.user
  }
}
