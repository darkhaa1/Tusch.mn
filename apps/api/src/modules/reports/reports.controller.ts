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
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { GetAdminReportsQueryDto } from './dto/get-admin-reports-query.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reports')
  create(
    @Body() dto: CreateReportDto,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.reportsService.create(dto, userId as string);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/reports')
  findAllAdmin(
    @GetUser() user: { id?: string; sub?: string },
    @Query() query: GetAdminReportsQueryDto,
  ) {
    const userId = user.id ?? user.sub;
    return this.reportsService.findAllAdmin(userId as string, query);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/reports/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.reportsService.updateStatus(userId as string, id, dto);
  }
}
