import { Controller, Post, Body, Res, Get, Req, UnauthorizedException, UseGuards, Patch } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OAuthLoginDto } from './dto/oauth-login.dto';

@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(private authService: AuthService) {}

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
        avatarUrl: result.avatarUrl,
      },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) // dY`^ ton JWT guard ici
  async getMe(@Req() req) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.authService.getUserById(userId);
    return { user: this.authService.sanitizeUser(user) }; // req.user doit A¦tre injectAc par le guard
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Req() req, @Body() body) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const updatedUser = await this.authService.updateProfile(userId, {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      avatarUrl: body.avatarUrl,
      accountType: body.accountType,
    });

    return { user: updatedUser };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false, // align with login cookie options; set true in production with HTTPS
      sameSite: 'lax',
      path: '/',
    });
    return { message: 'Logout successful' };
  }

  @Post('oauth-login')
  async oauthLogin(@Body() body: OAuthLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.oauthLogin(body);

    const cookieOptions = {
      httpOnly: true,
      secure: false, // true en prod (HTTPS)
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    };

    res.cookie('accessToken', result.accessToken, cookieOptions);

    return {
      user: {
        id: result.id,
        email: result.email,
        avatarUrl: result.avatarUrl,
      },
    };
  }
}
