import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OccurrenceCategoriesService } from './occurrence-categories.service';
import { CreateOccurrenceCategoryDto } from './dto/create-occurrence-category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

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
  create(@Body() body: CreateOccurrenceCategoryDto) {
    return this.occurrenceCategoriesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERADOR)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.occurrenceCategoriesService.remove(id);
  }
}
