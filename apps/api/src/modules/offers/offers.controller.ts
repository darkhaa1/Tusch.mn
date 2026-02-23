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
import { GetUser } from '../../common/decorators/get-user.decorator';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { CreateOfferDto } from './dto/create-offer.dto';
import { GetOffersQueryDto } from './dto/get-offers-query.dto';
import { OffersService } from './offers.service';

@Controller('offers')
@ApiTags('offers')
export class OffersController {
  constructor(private readonly service: OffersService) {}

  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  @Post('listing/:listingId')
  create(
    @Param('listingId') listingId: string,
    @Body() dto: CreateOfferDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.create(listingId, dto, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sent')
  findSent(
    @Query() q: GetOffersQueryDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.findSent(user.id, q.page, q.limit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('received')
  findReceived(
    @Query() q: GetOffersQueryDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.findReceived(user.id, q.page, q.limit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('listing/:listingId')
  findByListing(
    @Param('listingId') listingId: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.findByListing(listingId, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.findOne(id, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.cancel(id, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/accept')
  accept(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.accept(id, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.reject(id, user.id);
  }
}
