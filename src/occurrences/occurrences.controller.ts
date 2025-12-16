import {
  Body,
  Controller,
  Get,
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
import { ListOccurrencesQueryDto } from './dto/list-occurrences.query';
import { UpdateOccurrenceStatusDto } from './dto/update-occurence-status.dto';
import { AssignModeratorDto } from './dto/assign-moderator.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

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

  @UseGuards(JwtAuthGuard)
  @Roles(Role.MODERADOR, Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOccurrenceStatusDto,
  ) {
    return this.occurrencesService.updateStatus(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.MODERADOR, Role.ADMIN)
  @Patch(':id/assign')
  async assignModerator(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AssignModeratorDto,
  ) {
    return this.occurrencesService.assignModerator(id, body);
  }
}
