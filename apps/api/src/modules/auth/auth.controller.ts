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
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarMulterOptions } from '../../common/multer/image-options';
import { join } from 'path';
import * as fs from 'fs';
import { AVATAR_UPLOAD_DIR } from '../../common/multer/constants';
import { ChangePasswordDto } from './dto/change-password.dto';
import { sanitizeFilename } from '../../common/utils/validate-file-type';

@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(private authService: AuthService) {}

  private get cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const, // 🔒 Changed from 'lax' to 'strict' for CSRF protection
      maxAge: 15 * 60 * 1000, // 🔒 Reduced from 24h to 15min (use refresh token for longer sessions)
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
    };
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 🔒 Max 3 inscriptions/heure
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 🔒 Max 5 tentatives de login/minute
  async login(
    @Body() dto: LoginDto, // 🔒 Changed from 'body' to typed DTO
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

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
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.authService.getUserById(userId);
    return { user: this.authService.sanitizeUser(user) };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', avatarMulterOptions))
  async updateMe(
    @Req() req,
    @Body() dto: UpdateProfileDto, // 🔒 Changed from 'body' to typed DTO
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const removeAvatar = req.body?.removeAvatar === 'true';
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
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      avatarUrl,
      accountType: dto.accountType,
      // 🔒 Email change removed - should be separate endpoint with verification
    });

    // 🔒 Secure file cleanup with path traversal protection
    if (
      shouldCleanOldAvatar &&
      previousAvatarUrl?.startsWith('/uploads/avatars/')
    ) {
      const previousName = previousAvatarUrl.split('/').pop();
      if (previousName && previousName !== file?.filename) {
        try {
          // 🔒 Validate filename to prevent path traversal
          const safeFilename = sanitizeFilename(previousName);
          const previousPath = join(AVATAR_UPLOAD_DIR, safeFilename);
          await fs.promises.unlink(previousPath).catch(() => undefined);
        } catch {
          // Invalid filename, skip cleanup
        }
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
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 🔒 Max 3 changements de password/heure
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

    // 🔒 Secure file cleanup with path traversal protection
    const avatarUrl = currentUser?.avatarUrl;
    if (avatarUrl?.startsWith('/uploads/avatars/')) {
      const avatarName = avatarUrl.split('/').pop();
      if (avatarName) {
        try {
          const safeFilename = sanitizeFilename(avatarName);
          const avatarPath = join(AVATAR_UPLOAD_DIR, safeFilename);
          await fs.promises.unlink(avatarPath).catch(() => undefined);
        } catch {
          // Invalid filename, skip cleanup
        }
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
