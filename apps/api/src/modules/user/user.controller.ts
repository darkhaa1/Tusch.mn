import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { UpdateMyRoleDto } from './dto/update-my-role.dto';
import { UserRole } from '@repo/shared';
import { GetProvidersQueryDto } from './dto/get-providers-query.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { AuthenticatedRequest } from '../../common/types/request.types';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
