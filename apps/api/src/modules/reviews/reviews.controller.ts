import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
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
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsQueryDto } from './dto/get-reviews-query.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@ApiTags('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a review for a completed offer' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({ status: 201, description: 'Review created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (offer not COMPLETED or not a party)' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiResponse({ status: 409, description: 'Already reviewed this offer' })
  create(
    @Body() dto: CreateReviewDto,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.create(dto, userId as string);
  }

  @UseGuards(JwtAuthGuard)
  @Get('offer/:offerId/mine')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check if current user already reviewed this offer' })
  @ApiParam({ name: 'offerId', description: 'Offer ID' })
  @ApiResponse({ status: 200, schema: { example: { reviewed: false } } })
  checkMine(
    @Param('offerId') offerId: string,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.checkReview(offerId, userId as string);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get reviews received by a user' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated reviews' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getReviews(
    @Param('userId') userId: string,
    @Query() query: GetReviewsQueryDto,
  ) {
    return this.service.findByTargetUser(userId, query.page, query.limit);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  @ApiResponse({ status: 403, description: 'Not your review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  delete(
    @Param('id') id: string,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.delete(id, userId as string);
  }
}
