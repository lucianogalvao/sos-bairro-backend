import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // 📊 Overview geral
  @Get('overview')
  async overview() {
    return this.reportsService.overview();
  }

  // 📊 Por categoria
  @Get('by-category')
  async byCategory() {
    return this.reportsService.byCategory();
  }

  // 📊 Evolução por data
  @Get('by-date')
  async byDate(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.byDate(from, to);
  }
}
