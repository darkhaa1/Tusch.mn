import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/register.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarMulterOptions } from '../../common/multer/image-options';
import { join } from 'path';
import * as fs from 'fs';
import { AVATAR_UPLOAD_DIR } from '../../common/multer/constants';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(private authService: AuthService) {}

  private get cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
    };
  }

  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body);

    res.cookie('accessToken', result.accessToken, this.cookieOptions);
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
  @UseInterceptors(FileInterceptor('avatar', avatarMulterOptions))
  async updateMe(
    @Req() req,
    @Body() body,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const removeAvatar =
      body?.removeAvatar === 'true' || body?.removeAvatar === true;
    const avatarUrl = removeAvatar
      ? null
      : file
        ? `/uploads/avatars/${file.filename}`
        : undefined;
    const shouldCleanOldAvatar = removeAvatar || !!file;

    let previousAvatarUrl: string | null = null;
    if (shouldCleanOldAvatar) {
      const currentUser = await this.authService.getUserById(userId);
      previousAvatarUrl = currentUser?.avatarUrl || null;
    }

    const updatedUser = await this.authService.updateProfile(userId, {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      avatarUrl,
      accountType: body.accountType,
      email: body.email,
    });

    if (
      shouldCleanOldAvatar &&
      previousAvatarUrl?.startsWith('/uploads/avatars/')
    ) {
      const previousName = previousAvatarUrl.split('/').pop();
      if (previousName && previousName !== file?.filename) {
        const previousPath = join(AVATAR_UPLOAD_DIR, previousName);
        fs.promises.unlink(previousPath).catch(() => undefined);
      }
    }
    return { user: updatedUser };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', { ...this.cookieOptions, maxAge: 0 });
    return { message: 'Logout successful' };
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req, @Body() body: ChangePasswordDto) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Unauthorized');
    await this.authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
    return { success: true };
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMe(@Req() req, @Res({ passthrough: true }) res: Response) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const currentUser = await this.authService.getUserById(userId);
    if (!currentUser) throw new UnauthorizedException('Unauthorized');

    await this.authService.deleteUserById(userId);
    res.clearCookie('accessToken', { ...this.cookieOptions, maxAge: 0 });

    const avatarUrl = currentUser?.avatarUrl;
    if (avatarUrl?.startsWith('/uploads/avatars/')) {
      const avatarName = avatarUrl.split('/').pop();
      if (avatarName) {
        const avatarPath = join(AVATAR_UPLOAD_DIR, avatarName);
        fs.promises.unlink(avatarPath).catch(() => undefined);
      }
    }

    return { success: true };
  }

  @Post('oauth-login')
  async oauthLogin(
    @Body() body: OAuthLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.oauthLogin(body);

    res.cookie('accessToken', result.accessToken, this.cookieOptions);

    return {
      user: {
        id: result.id,
        email: result.email,
        avatarUrl: result.avatarUrl,
      },
    };
  }
}
