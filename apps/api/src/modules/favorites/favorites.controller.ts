import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { FavoritesService } from './favorites.service';
import { GetFavoritesQueryDto } from './dto/get-favorites-query.dto';

@Controller('favorites')
@ApiTags('favorites')
export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('listings/:listingId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add listing to favorites' })
  @ApiParam({ name: 'listingId', description: 'Listing ID' })
  @ApiResponse({ status: 201, description: 'Favorite created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  @ApiResponse({ status: 409, description: 'Already favorited' })
  addListingFavorite(
    @Param('listingId') listingId: string,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.addListingFavorite(userId as string, listingId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('listings/:listingId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove listing from favorites' })
  @ApiParam({ name: 'listingId', description: 'Listing ID' })
  @ApiResponse({ status: 200, description: 'Favorite removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  removeListingFavorite(
    @Param('listingId') listingId: string,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.removeListingFavorite(userId as string, listingId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('listings')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List my favorite listings' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated favorites' })
  listListingFavorites(
    @Query() query: GetFavoritesQueryDto,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.listFavoriteListings(
      userId as string,
      query.page ?? 1,
      query.limit ?? 12,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('providers/:providerId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add provider to favorites' })
  @ApiParam({ name: 'providerId', description: 'Provider ID' })
  @ApiResponse({ status: 201, description: 'Favorite created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  @ApiResponse({ status: 409, description: 'Already favorited' })
  addProviderFavorite(
    @Param('providerId') providerId: string,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.addProviderFavorite(userId as string, providerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('providers/:providerId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove provider from favorites' })
  @ApiParam({ name: 'providerId', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Favorite removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  removeProviderFavorite(
    @Param('providerId') providerId: string,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.removeProviderFavorite(userId as string, providerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('providers')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List my favorite providers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated favorites' })
  listProviderFavorites(
    @Query() query: GetFavoritesQueryDto,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.listFavoriteProviders(
      userId as string,
      query.page ?? 1,
      query.limit ?? 12,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('check/listing/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check if listing is favorited' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiResponse({ status: 200, description: 'Favorited state' })
  checkListingFavorite(
    @Param('id') listingId: string,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.isListingFavorited(userId as string, listingId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('check/provider/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check if provider is favorited' })
  @ApiParam({ name: 'id', description: 'Provider ID' })
  @ApiResponse({ status: 200, description: 'Favorited state' })
  checkProviderFavorite(
    @Param('id') providerId: string,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.service.isProviderFavorited(userId as string, providerId);
  }
}
