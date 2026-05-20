import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_CONFIGS } from '../../common/throttler';
import { kycDocumentMulterOptions } from '../../common/multer/image-options';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserVerificationService } from './user-verification.service';
import { UserServiceZonesService } from './user-service-zones.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { UpdateMyRoleDto } from './dto/update-my-role.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { UpdateServiceZonesDto } from './dto/update-service-zones.dto';
import { UserRole } from '@repo/shared';
import { GetProvidersQueryDto } from './dto/get-providers-query.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AuthenticatedRequest } from '../../common/types/request.types';
import { UpdateEmailPreferencesDto } from './dto/update-email-preferences.dto';
import {
  DEFAULT_EMAIL_NOTIFICATION_PREFERENCES,
  type EmailNotificationKey,
  mergeEmailPreferences,
} from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly verificationService: UserVerificationService,
    private readonly zonesService: UserServiceZonesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me/auth-methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get the auth methods configured on the current user',
    description:
      'Returns email, phone, hasPassword + canUnlinkEmail / canUnlinkPhone ' +
      'guard flags. Values are only returned for the authenticated user — ' +
      'callers cannot inspect other users (anti-IDOR).',
  })
  @ApiResponse({
    status: 200,
    description: 'Auth methods snapshot',
    schema: {
      example: {
        email: { value: 'darkhaa@example.com', verified: true },
        phone: { value: '+97699112233', verified: true },
        hasPassword: true,
        canUnlinkEmail: true,
        canUnlinkPhone: true,
      },
    },
  })
  async getAuthMethods(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id!;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailVerified: true,
        phone: true,
        phoneVerified: true,
        password: true,
      },
    });
    if (!user) throw new BadRequestException('User not found');

    const hasEmail = !!user.email;
    const hasPhone = !!user.phone;
    const hasPassword = !!user.password;
    // Count distinct auth methods. Email alone (without password) is not a
    // login method — it gates verification but cannot be used to sign in.
    const methodCount =
      (hasEmail && hasPassword ? 1 : 0) + (hasPhone ? 1 : 0);

    return {
      email: hasEmail
        ? { value: user.email, verified: user.emailVerified }
        : null,
      phone: hasPhone
        ? { value: user.phone, verified: user.phoneVerified }
        : null,
      hasPassword,
      canUnlinkEmail: hasEmail && methodCount > 1,
      canUnlinkPhone: hasPhone && methodCount > 1,
    };
  }

  @Get('me/email-preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get email notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Preferences (with defaults applied for missing keys)',
  })
  async getEmailPreferences(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id!;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailNotifications: true },
    });
    const stored =
      user?.emailNotifications &&
      typeof user.emailNotifications === 'object' &&
      !Array.isArray(user.emailNotifications)
        ? (user.emailNotifications as Record<string, unknown>)
        : {};
    const merged = {
      ...DEFAULT_EMAIL_NOTIFICATION_PREFERENCES,
    } as Record<EmailNotificationKey, boolean>;
    for (const key of Object.keys(merged) as EmailNotificationKey[]) {
      const value = stored[key];
      if (typeof value === 'boolean') merged[key] = value;
    }
    return { preferences: merged };
  }

  @Patch('me/email-preferences')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update email notification preferences (partial)' })
  @ApiBody({ type: UpdateEmailPreferencesDto })
  @ApiResponse({ status: 200, description: 'Updated preferences' })
  async updateEmailPreferences(
    @Req() req: AuthenticatedRequest,
    @Body() patch: UpdateEmailPreferencesDto,
  ) {
    const userId = req.user.id!;
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailNotifications: true },
    });
    const merged = mergeEmailPreferences(
      current?.emailNotifications ?? {},
      patch,
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailNotifications: merged as object },
    });
    const fullView = {
      ...DEFAULT_EMAIL_NOTIFICATION_PREFERENCES,
      ...merged,
    };
    return { preferences: fullView };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({
    status: 200,
    description: 'Paginated users',
    schema: {
      example: {
        items: [{ id: 'usr_1', email: 'user@example.com' }],
        total: 1,
        page: 1,
        limit: 20,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getAll(@Query() query: GetUsersQueryDto) {
    return this.userService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    schema: {
      example: {
        id: 'usr_1',
        email: 'user@example.com',
        firstName: 'Bataa',
        lastName: 'Enkh',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.userService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/role')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update my role (CLIENT/PROVIDER/BOTH)' })
  @ApiBody({ type: UpdateMyRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Role updated',
    schema: { example: { user: { id: 'usr_1', role: 'PROVIDER' } } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async updateMyRole(@Req() req: AuthenticatedRequest, @Body() body: UpdateMyRoleDto) {
    const userId = req.user.id;
    const updated = await this.userService.updateMyRole(
      userId,
      body.role as UserRole,
    );
    return { user: updated };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('onboarding')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Complete onboarding wizard' })
  @ApiBody({ type: CompleteOnboardingDto })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completed',
    schema: { example: { user: { id: 'usr_1', onboardingCompletedAt: '2026-03-19T00:00:00.000Z' } } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeOnboarding(
    @Req() req: AuthenticatedRequest,
    @Body() body: CompleteOnboardingDto,
  ) {
    const userId = req.user.id;
    const user = await this.userService.completeOnboarding(userId, body);
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('verification/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my verification status' })
  @ApiResponse({ status: 200, description: 'Verification status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getVerificationStatus(@Req() req: AuthenticatedRequest) {
    return this.verificationService.getVerificationStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verification/submit')
  @Throttle({ default: THROTTLE_CONFIGS.KYC_SUBMIT })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit identity document for verification' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { document: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Document submitted' })
  @ApiResponse({ status: 400, description: 'No file or invalid file type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('document', kycDocumentMulterOptions))
  async submitVerification(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Document file is required');
    return this.verificationService.submitVerification(req.user.id, file.filename);
  }

  @UseGuards(JwtAuthGuard)
  @Put('service-zones')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Replace all service zones for the current user' })
  @ApiBody({ type: UpdateServiceZonesDto })
  @ApiResponse({ status: 200, description: 'Service zones updated' })
  @ApiResponse({ status: 400, description: 'Validation error or invalid city/district' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateServiceZones(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateServiceZonesDto,
  ) {
    return this.zonesService.updateServiceZones(req.user.id, body.zones);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('providers')
  @ApiOperation({ summary: 'List providers' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated providers',
    schema: {
      example: {
        items: [
          { id: 'usr_2', firstName: 'Sara', role: 'PROVIDER' },
        ],
        total: 1,
        page: 1,
        limit: 12,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getProviders(
    @Query() query: GetProvidersQueryDto,
    @GetUser() user?: { id?: string; sub?: string },
  ) {
    const userId = user?.id ?? user?.sub;
    return this.userService.getProviders(query, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/service-zones')
  @ApiOperation({ summary: 'Get service zones for a provider' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Service zones list' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getServiceZones(@Param('id') id: string) {
    return this.zonesService.getServiceZones(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/public')
  @ApiOperation({ summary: 'Get public profile for a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Public profile',
    schema: {
      example: {
        id: 'usr_2',
        firstName: 'Sara',
        reviews: { items: [], total: 0, page: 1, limit: 10 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPublicProfile(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @GetUser() user?: { id?: string; sub?: string },
  ) {
    const pageNumber = page ? Number(page) : undefined;
    const limitNumber = limit ? Number(limit) : undefined;
    const userId = user?.id ?? user?.sub;
    return this.userService.getPublicProfile(id, {
      page: pageNumber,
      limit: limitNumber,
      viewerId: userId,
    });
  }
}
