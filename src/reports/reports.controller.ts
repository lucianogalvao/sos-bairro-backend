import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('overview')
  async overview() {
    return this.reportsService.overview();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-category')
  async byCategory() {
    return this.reportsService.byCategory();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-date')
  async byDate(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.byDate(from, to);
  }
}
