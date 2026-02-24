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
import { GetUser } from '../../common/decorators/get-user.decorator';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { CompleteOfferDto } from './dto/complete-offer.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { GetOffersQueryDto } from './dto/get-offers-query.dto';
import { OffersService } from './offers.service';

@Controller('offers')
@ApiTags('offers')
@ApiBearerAuth('JWT-auth')
export class OffersController {
  constructor(private readonly service: OffersService) {}

  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  @Post('listing/:listingId')
  @ApiOperation({ summary: 'Create an offer for a listing' })
  @ApiParam({ name: 'listingId', description: 'Listing ID' })
  @ApiBody({ type: CreateOfferDto })
  @ApiResponse({
    status: 201,
    description: 'Offer created',
    schema: {
      example: {
        id: 'offer_123',
        price: 50000,
        message: 'I can complete this in 2 days.',
        status: 'PENDING',
        estimatedDays: 2,
        createdAt: '2026-02-23T12:00:00.000Z',
        provider: { id: 'usr_1', firstName: 'Bataa', lastName: 'Enkh' },
        listing: {
          id: 'lst_1',
          description: 'Math tutoring',
          price: 60000,
          userId: 'usr_2',
          category: 'tutoring',
          location: 'UB',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  create(
    @Param('listingId') listingId: string,
    @Body() dto: CreateOfferDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.create(listingId, dto, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sent')
  @ApiOperation({ summary: 'List offers sent by the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated sent offers',
    schema: {
      example: {
        items: [
          {
            id: 'offer_123',
            price: 50000,
            message: 'I can do it.',
            status: 'PENDING',
            listing: { id: 'lst_1', description: 'Math tutoring' },
          },
        ],
        total: 12,
        page: 1,
        limit: 12,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findSent(
    @Query() q: GetOffersQueryDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.findSent(user.id, q.page, q.limit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('received')
  @ApiOperation({ summary: 'List offers received for my listings' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated received offers',
    schema: {
      example: {
        items: [
          {
            id: 'offer_987',
            price: 45000,
            message: 'Available next week.',
            status: 'PENDING',
            provider: { id: 'usr_5', firstName: 'Sara' },
          },
        ],
        total: 4,
        page: 1,
        limit: 12,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findReceived(
    @Query() q: GetOffersQueryDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.findReceived(user.id, q.page, q.limit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('listing/:listingId')
  @ApiOperation({ summary: 'List offers for a listing I own' })
  @ApiParam({ name: 'listingId', description: 'Listing ID' })
  @ApiResponse({
    status: 200,
    description: 'Offers for listing',
    schema: {
      example: [
        {
          id: 'offer_123',
          price: 50000,
          message: 'I can do it.',
          status: 'PENDING',
          provider: { id: 'usr_1', firstName: 'Bataa' },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  findByListing(
    @Param('listingId') listingId: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.findByListing(listingId, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  @ApiOperation({ summary: 'List my completed offers history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated history',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  history(@Query() q: GetOffersQueryDto, @GetUser() user: { id: string }) {
    return this.service.findHistory(user.id, q.page, q.limit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history/as-client')
  @ApiOperation({ summary: 'List my completed offers as client' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated history as client',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  historyAsClient(
    @Query() q: GetOffersQueryDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.findHistoryAsClient(user.id, q.page, q.limit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('history/as-provider')
  @ApiOperation({ summary: 'List my completed offers as provider' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated history as provider',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  historyAsProvider(
    @Query() q: GetOffersQueryDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.findHistoryAsProvider(user.id, q.page, q.limit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  @ApiOperation({ summary: 'Get completed offers stats' })
  @ApiResponse({ status: 200, description: 'Stats' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  stats(@GetUser() user: { id: string }) {
    return this.service.getStats(user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get an offer by id' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({
    status: 200,
    description: 'Offer details',
    schema: {
      example: {
        id: 'offer_123',
        price: 50000,
        message: 'I can do it.',
        status: 'PENDING',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  findOne(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.findOne(id, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending offer' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({
    status: 200,
    description: 'Offer cancelled',
    schema: {
      example: {
        id: 'offer_123',
        status: 'CANCELLED',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Only pending offers can be cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  cancel(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.cancel(id, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete an accepted offer' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiBody({ type: CompleteOfferDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Offer completed',
    schema: {
      example: {
        id: 'offer_123',
        status: 'COMPLETED',
        completedAt: '2026-02-24T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Only accepted offers can be completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  complete(
    @Param('id') id: string,
    @Body() dto: CompleteOfferDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.complete(id, user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept a pending offer' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({
    status: 200,
    description: 'Offer accepted',
    schema: {
      example: {
        id: 'offer_123',
        status: 'ACCEPTED',
        respondedAt: '2026-02-23T12:05:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Only pending offers can be accepted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  accept(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.accept(id, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a pending offer' })
  @ApiParam({ name: 'id', description: 'Offer ID' })
  @ApiResponse({
    status: 200,
    description: 'Offer rejected',
    schema: {
      example: {
        id: 'offer_123',
        status: 'REJECTED',
        respondedAt: '2026-02-23T12:05:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Only pending offers can be rejected' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  reject(
    @Param('id') id: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.reject(id, user.id);
  }
}
