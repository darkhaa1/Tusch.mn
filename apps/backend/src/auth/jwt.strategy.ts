import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

function cookieExtractor(req: Request): string | null {
  return req?.cookies?.accessToken ?? null; // <-- le nom de TON cookie
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(), // fallback si besoin
      ]),
      secretOrKey: process.env.JWT_SECRET!,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // payload attendu: { sub: userId, email }
    if (!payload?.sub) throw new UnauthorizedException('Invalid token');
    return { id: payload.sub, email: payload.email }; // devient req.user
  }
}
