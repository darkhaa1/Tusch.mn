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
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateMyRoleDto } from './dto/update-my-role.dto';
import { UserRole } from '@prisma/client';
import { GetProvidersQueryDto } from './dto/get-providers-query.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Query() query: GetUsersQueryDto) {
    return this.userService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const userId = req.user?.sub;
    return this.userService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/role')
  async updateMyRole(@Req() req, @Body() body: UpdateMyRoleDto) {
    const userId = req.user?.sub;
    const updated = await this.userService.updateMyRole(
      userId,
      body.role as UserRole,
    );
    return { user: updated };
  }

  @Get('providers')
  async getProviders(@Query() query: GetProvidersQueryDto) {
    return this.userService.getProviders(query);
  }

  @Get(':id/public')
  async getPublicProfile(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? Number(page) : undefined;
    const limitNumber = limit ? Number(limit) : undefined;
    return this.userService.getPublicProfile(id, {
      page: pageNumber,
      limit: limitNumber,
    });
  }
}
