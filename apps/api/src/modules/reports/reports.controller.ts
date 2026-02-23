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
import { Throttle } from '@nestjs/throttler';
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
import { CreateReportDto } from './dto/create-report.dto';
import { GetAdminReportsQueryDto } from './dto/get-admin-reports-query.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller()
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('reports')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Create a report' })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({
    status: 201,
    description: 'Report created',
    schema: {
      example: {
        id: 'rep_1',
        targetType: 'LISTING',
        targetId: 'lst_1',
        reason: 'SPAM',
        status: 'OPEN',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  create(
    @Body() dto: CreateReportDto,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.reportsService.create(dto, userId as string);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/reports')
  @ApiOperation({ summary: 'List reports (admin)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'targetType', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated reports',
    schema: {
      example: {
        items: [
          {
            id: 'rep_1',
            targetType: 'LISTING',
            targetId: 'lst_1',
            reason: 'SPAM',
            status: 'OPEN',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findAllAdmin(
    @GetUser() user: { id?: string; sub?: string },
    @Query() query: GetAdminReportsQueryDto,
  ) {
    const userId = user.id ?? user.sub;
    return this.reportsService.findAllAdmin(userId as string, query);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/reports/:id')
  @ApiOperation({ summary: 'Update report status (admin)' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiBody({ type: UpdateReportStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Report status updated',
    schema: { example: { id: 'rep_1', status: 'REVIEWED' } },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
    @GetUser() user: { id?: string; sub?: string },
  ) {
    const userId = user.id ?? user.sub;
    return this.reportsService.updateStatus(userId as string, id, dto);
  }
}
