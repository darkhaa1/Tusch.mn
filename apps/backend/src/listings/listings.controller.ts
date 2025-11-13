import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { GetUser } from '../auth/get-user.decorator';

@Controller('listings')
export class ListingsController {
  constructor(private readonly service: ListingsService) { }

  // Création REQUIERT d'être connecté
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateListingDto, @GetUser() user: { id: string }) {
    return this.service.create(dto, user.id);
  }

  // Lister : public (ou protège si tu veux)
  @Get()
  findAll(@Query() q: QueryListingDto) {
    return this.service.findAll(q);
  }

  // Détail : public (ou protège si tu veux)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // Update/Delete : protégé + ownership en service
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateListingDto, @GetUser() user: { id: string }) {
    return this.service.update(id, dto, user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.service.remove(id, user.id);
  }
}
