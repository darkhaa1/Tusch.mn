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
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_CONFIGS } from '../../common/throttler';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { AuthenticatedRequest } from '../../common/types/request.types';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarMulterOptions } from '../../common/multer/image-options';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { LinkPhoneDto } from './dto/link-phone.dto';
import { UnlinkPhoneDto } from './dto/unlink-phone.dto';
import { AuditService } from '../audit/audit.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private auditService: AuditService,
  ) {}

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
  @Throttle({ default: THROTTLE_CONFIGS.AUTH_REGISTER })
  @ApiOperation({ summary: 'Create an account' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({
    status: 201,
    description: 'Account created',
    schema: { example: { id: 'usr_1', email: 'user@example.com' } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already used' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: THROTTLE_CONFIGS.AUTH_LOGIN })
  @ApiOperation({ summary: 'Login' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful (JWT cookie)',
    schema: {
      example: {
        user: { id: 'usr_1', email: 'user@example.com', avatarUrl: null },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    schema: { example: { user: { id: 'usr_1', email: 'user@example.com' } } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getMe(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.authService.getUserById(userId);
    return { user: this.authService.sanitizeUser(user) };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', avatarMulterOptions))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Bataa' },
        lastName: { type: 'string', example: 'Enkh' },
        phone: { type: 'string', example: '99112233' },
        email: { type: 'string', example: 'user@example.com' },
        accountType: { type: 'string', example: 'basic' },
        removeAvatar: { type: 'boolean', example: false },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated',
    schema: { example: { user: { id: 'usr_1', firstName: 'Bataa' } } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const removeAvatar = body.removeAvatar === true;
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

    const updatedUser = await this.authService.updateProfile(
      userId,
      {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        avatarUrl,
        accountType: body.accountType,
        email: body.email,
      },
      shouldCleanOldAvatar ? previousAvatarUrl : undefined,
    );

    return { user: updatedUser };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({
    status: 201,
    description: 'Logout successful',
    schema: { example: { message: 'Logout successful' } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', { ...this.cookieOptions, maxAge: 0 });
    return { message: 'Logout successful' };
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async changePassword(@Req() req: AuthenticatedRequest, @Body() body: ChangePasswordDto) {
    const userId = req.user.id;
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete my account' })
  @ApiResponse({
    status: 200,
    description: 'Account deleted',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async deleteMe(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const currentUser = await this.authService.getUserById(userId);
    if (!currentUser) throw new UnauthorizedException('Unauthorized');

    await this.authService.deleteUserById(userId);
    res.clearCookie('accessToken', { ...this.cookieOptions, maxAge: 0 });

    return { success: true };
  }

  @Post('forgot-password')
  @Throttle({ default: THROTTLE_CONFIGS.AUTH_RESET_PASSWORD })
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 201,
    description: 'Email sent if account exists',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @Throttle({ default: THROTTLE_CONFIGS.AUTH_RESET_PASSWORD })
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 201,
    description: 'Password reset',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { success: true };
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email using token' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 201,
    description: 'Email verified',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 2 } })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({
    status: 201,
    description: 'Verification email resent',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Email already verified' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async resendVerification(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized');
    return this.authService.resendVerification(userId);
  }

  @Post('oauth-login')
  @ApiOperation({ summary: 'OAuth login' })
  @ApiBody({ type: OAuthLoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful (JWT cookie)',
    schema: {
      example: {
        user: { id: 'usr_1', email: 'user@example.com', avatarUrl: null },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
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
        adminRole: result.adminRole,
        isAdmin: result.isAdmin,
      },
    };
  }

  // ── Phone auth ───────────────────────────────────────────────────────────

  @Post('phone/login')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiOperation({
    summary: 'Login or register via a Firebase phone ID token',
    description:
      'Verifies the Firebase ID token server-side, matches or creates the user, ' +
      'and sets the standard `accessToken` cookie used by every other Tusch endpoint.',
  })
  @ApiBody({ type: PhoneLoginDto })
  @ApiResponse({
    status: 201,
    description: 'Login successful (JWT cookie)',
    schema: {
      example: {
        user: {
          id: 'usr_1',
          phone: '+97699112233',
          phoneVerified: true,
          email: null,
          avatarUrl: null,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid phone or phone mismatch' })
  @ApiResponse({ status: 401, description: 'Invalid Firebase ID token' })
  @ApiResponse({ status: 503, description: 'Phone auth not configured' })
  async phoneLogin(
    @Body() body: PhoneLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginOrRegisterWithPhone(body);

    res.cookie('accessToken', result.accessToken, this.cookieOptions);

    void this.auditService.log({
      actorId: result.id,
      action: 'PHONE_LOGIN',
      targetType: 'USER',
      targetId: result.id,
      metadata: { phone: result.phone ?? '', created: result.created },
    });

    return {
      user: {
        id: result.id,
        email: result.email ?? null,
        phone: result.phone ?? null,
        phoneVerified: result.phoneVerified ?? false,
        avatarUrl: result.avatarUrl ?? null,
        adminRole: result.adminRole,
        isAdmin: result.isAdmin,
      },
    };
  }

  @Post('phone/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({
    summary: 'Attach a Firebase-verified phone to the authenticated user',
  })
  @ApiBody({ type: LinkPhoneDto })
  @ApiResponse({ status: 201, description: 'Phone linked' })
  @ApiResponse({ status: 400, description: 'Invalid phone or phone mismatch' })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid token' })
  @ApiResponse({
    status: 409,
    description: 'Phone or Firebase identity already linked to another user',
  })
  @ApiResponse({ status: 503, description: 'Phone auth not configured' })
  async phoneLink(
    @Req() req: AuthenticatedRequest,
    @Body() body: LinkPhoneDto,
  ) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const user = await this.authService.linkPhoneToExistingUser(userId, body);

    void this.auditService.log({
      actorId: userId,
      action: 'PHONE_LINK',
      targetType: 'USER',
      targetId: userId,
      metadata: { phone: user.phone ?? '' },
    });

    return { user };
  }

  @Post('phone/unlink')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({
    summary: 'Remove the phone factor from the authenticated user',
  })
  @ApiBody({ type: UnlinkPhoneDto })
  @ApiResponse({ status: 201, description: 'Phone unlinked' })
  @ApiResponse({
    status: 400,
    description: 'Phone is the only auth method on the account',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid password' })
  async phoneUnlink(
    @Req() req: AuthenticatedRequest,
    @Body() body: UnlinkPhoneDto,
  ) {
    const userId = req.user.id;
    if (!userId) throw new UnauthorizedException('Unauthorized');

    const result = await this.authService.unlinkPhoneFromUser(userId, body);

    void this.auditService.log({
      actorId: userId,
      action: 'PHONE_UNLINK',
      targetType: 'USER',
      targetId: userId,
    });

    return result;
  }
}
