import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('messages')
@ApiTags('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateMessageDto, @GetUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('with/:userId')
  getConversation(
    @Param('userId') otherUserId: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.getConversation(user.id, otherUserId);
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
