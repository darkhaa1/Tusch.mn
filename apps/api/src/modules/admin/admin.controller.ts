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
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { AdminListingsQueryDto } from './dto/admin-listings-query.dto';
import { AdminUpdateUserStatusDto } from './dto/admin-update-user-status.dto';
import { AdminUpdateListingStatusDto } from './dto/admin-update-listing-status.dto';

@Controller('admin')
@ApiTags('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  private resolveAdminId(req: any) {
    const adminId = req.user?.id ?? req.user?.sub;
    if (!adminId) {
      throw new UnauthorizedException('Unauthorized');
    }
    return adminId as string;
  }

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get('users')
  getUsers(@Query() query: AdminUsersQueryDto) {
    return this.service.getUsers(query);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserStatusDto,
  ) {
    const adminId = this.resolveAdminId(req);
    return this.service.updateUserStatus(adminId, id, dto.status);
  }

  @Patch('users/:id/restore')
  restoreUser(@Req() req, @Param('id') id: string) {
    const adminId = this.resolveAdminId(req);
    return this.service.restoreUser(adminId, id);
  }

  @Get('listings')
  getListings(@Query() query: AdminListingsQueryDto) {
    return this.service.getListings(query);
  }

  @Patch('listings/:id/status')
  updateListingStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: AdminUpdateListingStatusDto,
  ) {
    const adminId = this.resolveAdminId(req);
    return this.service.updateListingStatus(adminId, id, dto.status);
  }

  @Patch('listings/:id/restore')
  restoreListing(@Req() req, @Param('id') id: string) {
    const adminId = this.resolveAdminId(req);
    return this.service.restoreListing(adminId, id);
  }
}
