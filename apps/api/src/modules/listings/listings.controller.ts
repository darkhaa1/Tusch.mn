import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_CONFIGS } from '../../common/throttler';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { GetListingsQueryDto } from './dto/get-listings-query.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { listingImagesMulterOptions } from '../../common/multer/image-options';
import { EmailVerifiedGuard } from '../../common/guards/email-verified.guard';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { ListingOwnershipGuard } from '../../common/guards/ownership.guard';

@Controller('listings')
@ApiTags('listings')
export class ListingsController {
  constructor(private readonly service: ListingsService) {}

  @UseGuards(AuthGuard('jwt'), EmailVerifiedGuard)
  @Post()
  @Throttle({ default: THROTTLE_CONFIGS.LISTINGS_CREATE })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a listing' })
  @ApiBody({ type: CreateListingDto })
  @ApiResponse({
    status: 201,
    description: 'Listing created',
    schema: {
      example: {
        id: 'lst_1',
        description: 'Math tutoring',
        price: 60000,
        location: 'UB',
        category: 'tutoring',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  create(@Body() dto: CreateListingDto, @GetUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @Throttle({ default: THROTTLE_CONFIGS.SEARCH })
  @ApiOperation({ summary: 'List listings (public)' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'legacy', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated listings',
    schema: {
      example: {
        items: [
          { id: 'lst_1', description: 'Math tutoring', price: 60000 },
        ],
        total: 1,
        page: 1,
        limit: 12,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findAll(
    @Query() q: GetListingsQueryDto,
    @GetUser() user?: { id?: string; sub?: string },
  ) {
    const userId = user?.id ?? user?.sub;
    const result = await this.service.findAll(q, userId);
    if (q.legacy === 1) {
      return {
        data: result.items,
        pagination: {
          total: result.total,
          skip: (result.page - 1) * result.limit,
          take: result.limit,
        },
      };
    }
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List my listings' })
  @ApiResponse({
    status: 200,
    description: 'My listings',
    schema: { example: [{ id: 'lst_1', description: 'Math tutoring' }] },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getMyListings(@GetUser() user: { id: string }) {
    return this.service.getListingsByUser(user.id);
  }

  @Get('locations')
  @ApiOperation({ summary: 'List available locations' })
  @ApiResponse({
    status: 200,
    description: 'Locations',
    schema: { example: ['UB', 'Darkhan'] },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getDistinctLocations() {
    return this.service.getDistinctLocations();
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get listing details (public)' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiResponse({
    status: 200,
    description: 'Listing details',
    schema: {
      example: {
        id: 'lst_1',
        description: 'Math tutoring',
        price: 60000,
        location: 'UB',
        category: 'tutoring',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  findOne(
    @Param('id') id: string,
    @GetUser() user?: { id?: string; sub?: string },
  ) {
    const userId = user?.id ?? user?.sub;
    return this.service.findPublicById(id, userId);
  }

  @UseGuards(AuthGuard('jwt'), ListingOwnershipGuard)
  @Put(':id')
  @Throttle({ default: THROTTLE_CONFIGS.LISTINGS_UPDATE })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a listing' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiBody({ type: UpdateListingDto })
  @ApiResponse({
    status: 200,
    description: 'Listing updated',
    schema: { example: { id: 'lst_1', description: 'Updated description' } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.update(id, dto, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/images')
  @Throttle({ default: THROTTLE_CONFIGS.UPLOAD })
  @UseInterceptors(
    FilesInterceptor('files', undefined, listingImagesMulterOptions),
  )
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload listing images' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded',
    schema: {
      example: [
        { id: 'img_1', url: '/uploads/listings/img_1.jpg' },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: { id: string },
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return this.service.addImages(id, files, user.id);
  }

  @UseGuards(AuthGuard('jwt'), ListingOwnershipGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a listing' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiResponse({
    status: 200,
    description: 'Listing deleted',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  remove(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.service.remove(id, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/images/:imageId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a listing image' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiParam({ name: 'imageId', description: 'Image ID' })
  @ApiResponse({
    status: 200,
    description: 'Image deleted',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing or image not found' })
  deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.deleteImage(id, imageId, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/images/reorder')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reorder listing images' })
  @ApiParam({ name: 'id', description: 'Listing ID' })
  @ApiBody({ type: ReorderImagesDto })
  @ApiResponse({
    status: 200,
    description: 'Images reordered',
    schema: { example: { success: true } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  reorderImages(
    @Param('id') id: string,
    @Body() dto: ReorderImagesDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.reorderImages(id, dto.imageIds, user.id);
  }
}
