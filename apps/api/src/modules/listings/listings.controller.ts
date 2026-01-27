import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import {
  GetListingsQueryDto,
  ListingsSort,
} from './dto/get-listings-query.dto';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { listingImagesMulterOptions } from '../../common/multer/image-options';

@Controller('listings')
@ApiTags('listings')
export class ListingsController {
  constructor(private readonly service: ListingsService) {}

  // Création REQUIERT d'être connecté
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateListingDto, @GetUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  // Lister : public (ou protège si tu veux)
  @Get()
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '>= 1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '1..50',
  })
  @ApiQuery({ name: 'sort', required: false, enum: ListingsSort })
  @ApiQuery({
    name: 'legacy',
    required: false,
    type: Number,
    description: '1 to return legacy format',
  })
  async findAll(@Query() q: GetListingsQueryDto) {
    const result = await this.service.findAll(q);
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
  getMyListings(@GetUser() user: { id: string }) {
    return this.service.getListingsByUser(user.id);
  }
  // Détail : public (ou protège si tu veux)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findPublicById(id);
  }

  // Update/Delete : protégé + ownership en service
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @GetUser() user: { id: string },
  ) {
    return this.service.update(id, dto, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor('files', undefined, listingImagesMulterOptions),
  )
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: { id: string },
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier envoye');
    }
    return this.service.addImages(id, files, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.service.remove(id, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/images/:imageId')
  deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @GetUser() user: { id: string },
  ) {
    return this.service.deleteImage(id, imageId, user.id);
  }
}
