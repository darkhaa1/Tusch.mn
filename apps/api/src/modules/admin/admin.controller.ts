import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AuthenticatedRequest } from '../../common/types/request.types';
import { AdminService } from './admin.service';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { AdminListingsQueryDto } from './dto/admin-listings-query.dto';
import { AdminUpdateUserStatusDto } from './dto/admin-update-user-status.dto';
import { AdminUpdateListingStatusDto } from './dto/admin-update-listing-status.dto';

@Controller('admin')
@ApiTags('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  private resolveAdminId(req: AuthenticatedRequest): string {
    const adminId = req.user.id;
    if (!adminId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return adminId;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get admin stats' })
  @ApiResponse({
    status: 200,
    description: 'Stats',
    schema: {
      example: {
        users: 120,
        listings: 85,
        offers: 40,
        reports: 3,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getStats() {
    return this.service.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users (admin)' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated users',
    schema: {
      example: {
        items: [
          { id: 'usr_1', email: 'user@example.com', status: 'ACTIVE' },
        ],
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
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.service.getUsers(query);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status (admin)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: AdminUpdateUserStatusDto })
  @ApiResponse({
    status: 200,
    description: 'User status updated',
    schema: { example: { id: 'usr_1', status: 'SUSPENDED' } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUserStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserStatusDto,
  ) {
    const adminId = this.resolveAdminId(req);
    return this.service.updateUserStatus(adminId, id, dto.status);
  }

  @Patch('users/:id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted user (admin)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User restored',
    schema: { example: { id: 'usr_1', restored: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  restoreUser(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const adminId = this.resolveAdminId(req);
    return this.service.restoreUser(adminId, id);
  }

  @Get('listings')
  @ApiOperation({ summary: 'List listings (admin)' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated listings',
    schema: {
      example: {
        items: [
          { id: 'lst_1', description: 'Math tutoring', status: 'ACTIVE' },
        ],
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
  getListings(@Query() query: AdminListingsQueryDto) {
    return this.service.getListings(query);
  }

  @Patch('listings/:id/status')
  @ApiOperation({ summary: 'Update listing status (admin)' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiBody({ type: AdminUpdateListingStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Listing status updated',
    schema: { example: { id: 'lst_1', status: 'SUSPENDED' } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  updateListingStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AdminUpdateListingStatusDto,
  ) {
    const adminId = this.resolveAdminId(req);
    return this.service.updateListingStatus(adminId, id, dto.status);
  }

  @Patch('listings/:id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted listing (admin)' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiResponse({
    status: 200,
    description: 'Listing restored',
    schema: { example: { id: 'lst_1', restored: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  restoreListing(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const adminId = this.resolveAdminId(req);
    return this.service.restoreListing(adminId, id);
  }
}
