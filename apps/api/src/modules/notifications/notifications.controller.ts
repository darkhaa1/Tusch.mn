import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated notifications',
    schema: {
      example: {
        items: [
          {
            id: 'notif_1',
            type: 'NEW_MESSAGE',
            title: 'New message',
            body: 'You have a new message.',
            readAt: null,
          },
        ],
        total: 5,
        page: 1,
        limit: 20,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findAll(
    @GetUser() user: { id: string },
    @Query() q: GetNotificationsQueryDto,
  ) {
    return this.service.findAll(user.id, q.page, q.limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count',
    schema: { example: { count: 2 } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getUnreadCount(@GetUser() user: { id: string }) {
    return this.service.getUnreadCount(user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'Notifications marked as read',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  markAllAsRead(@GetUser() user: { id: string }) {
    return this.service.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.markAsRead(id, user.id);
  }
}
