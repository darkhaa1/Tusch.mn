import { Controller, Post, Body, Res, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OAuthLoginDto } from './dto/oauth-login.dto';

@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: false, // true en production avec HTTPS
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
      path: '/',
    });
    return {
      user: {
        id: result.id,
        email: result.email,
      },
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) // 👈 ton JWT guard ici
  getMe(@Req() req) {
    return { user: req.user }; // req.user doit être injecté par le guard
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    return { message: 'Logout successful' };
  }

  @Post('oauth-login')
  async oauthLogin(@Body() body: OAuthLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.oauthLogin(body);

    const cookieOptions = {
      httpOnly: true,
      secure: false,         // true en prod (HTTPS)
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    };

    res.cookie('accessToken', result.accessToken, cookieOptions);

    return {
      user: {
        id: result.id,
        email: result.email,
      },
    };
  }
}