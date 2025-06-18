import { Controller, Post, Body, Res, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';

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
  console.log('Login request body:', body);
  const result = await this.authService.login(body);

  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: false, // true en production avec HTTPS
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24,
  });
  return {user:{
    id:result.id,
    email: result.email,
    accessToken: result.accessToken,
  },
}
}


@Get('me')
@UseGuards(AuthGuard) // 👈 ton JWT guard ici
getMe(@Req() req) {
  return { user: req.user }; // req.user doit être injecté par le guard
}

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    return { message: 'Logout successful' };
  }
}