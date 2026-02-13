import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findAll(
    @GetUser() user: { id: string },
    @Query() q: GetNotificationsQueryDto,
  ) {
    return this.service.findAll(user.id, q.page, q.limit);
  }

  @Get('unread-count')
  getUnreadCount(@GetUser() user: { id: string }) {
    return this.service.getUnreadCount(user.id);
  }

  @Patch('read-all')
  markAllAsRead(@GetUser() user: { id: string }) {
    return this.service.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.markAsRead(id, user.id);
  }
}
