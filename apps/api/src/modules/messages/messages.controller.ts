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
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetConversationQueryDto } from './dto/get-conversation-query.dto';
import { MessagesService } from './messages.service';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';

@Controller('messages')
@ApiTags('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('unread-count')
  async getUnreadCount(@GetUser() user: { id: string }) {
    const count = await this.service.getUnreadCount(user.id);
    return { count };
  }

  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  @Post()
  create(@Body() dto: CreateMessageDto, @GetUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('with/:userId')
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
  getThreads(@GetUser() user: { id: string }) {
    return this.service.getThreads(user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.service.markAsRead(id, user.id);
  }
}
