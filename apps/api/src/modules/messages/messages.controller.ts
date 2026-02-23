import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetConversationQueryDto } from './dto/get-conversation-query.dto';
import { MessagesService } from './messages.service';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';

@Controller('messages')
@ApiTags('messages')
@ApiBearerAuth('JWT-auth')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count',
    schema: { example: { count: 3 } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getUnreadCount(@GetUser() user: { id: string }) {
    const count = await this.service.getUnreadCount(user.id);
    return { count };
  }

  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message sent',
    schema: {
      example: {
        id: 'msg_123',
        content: 'Hello!',
        senderId: 'usr_1',
        recipientId: 'usr_2',
        listingId: 'lst_1',
        createdAt: '2026-02-23T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  create(@Body() dto: CreateMessageDto, @GetUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('with/:userId')
  @ApiOperation({ summary: 'Get conversation with a user' })
  @ApiParam({ name: 'userId', description: 'Other user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Conversation messages',
    schema: {
      example: {
        items: [
          {
            id: 'msg_1',
            content: 'Hello!',
            senderId: 'usr_1',
            recipientId: 'usr_2',
            createdAt: '2026-02-23T12:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 30,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getConversation(
    @Param('userId') otherUserId: string,
    @Query() query: GetConversationQueryDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.getConversation(
      user.id,
      otherUserId,
      query.page,
      query.limit,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('threads')
  @ApiOperation({ summary: 'List message threads' })
  @ApiResponse({
    status: 200,
    description: 'Threads',
    schema: {
      example: [
        {
          user: { id: 'usr_2', firstName: 'Sara' },
          lastMessage: { id: 'msg_1', content: 'Hello!' },
          unreadCount: 1,
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getThreads(@GetUser() user: { id: string }) {
    return this.service.getThreads(user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  markAsRead(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.service.markAsRead(id, user.id);
  }
}
