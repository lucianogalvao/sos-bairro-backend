import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { OccurrenceCategoriesService } from './occurrence-categories.service';
import { RiskLevel } from '@prisma/client';

@Controller('categories')
export class OccurrenceCategoriesController {
  constructor(
    private readonly occurrenceCategoriesService: OccurrenceCategoriesService,
  ) {}

  @Get()
  findAll() {
    return this.occurrenceCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.occurrenceCategoriesService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      riskLevel: RiskLevel;
    },
  ) {
    return this.occurrenceCategoriesService.create(body);
  }
}
