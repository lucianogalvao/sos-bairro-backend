import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OccurrencesService } from './occurrences.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateOcurrenceDto } from './dto/create-ocurrence.dto';
import { AuthenticatedUser } from 'src/types';
import { ListOccurrencesQueryDto } from './dto/list-occurrences.dto';
import { UpdateOccurrenceStatusDto } from './dto/update-occurence-status.dto';
import { AssignModeratorDto } from './dto/assign-moderator.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('occurrences')
@ApiBearerAuth('access-token')
@Controller('occurrences')
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() body: CreateOcurrenceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const residentId = req.user.id;
    return this.occurrencesService.create(body, residentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-occurrences')
  async findMine(@Req() req: AuthenticatedRequest) {
    const residentId = req.user.id;
    return this.occurrencesService.findMine(residentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: ListOccurrencesQueryDto) {
    return this.occurrencesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.occurrencesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERADOR, Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOccurrenceStatusDto,
  ) {
    return this.occurrencesService.updateStatus(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MODERADOR, Role.ADMIN)
  @Patch(':id/assign')
  async assignModerator(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AssignModeratorDto,
  ) {
    return this.occurrencesService.assignModerator(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.occurrencesService.remove(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateOccurrence(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOccurrenceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.occurrencesService.updateOccurrence(id, dto, req.user);
  }
}
