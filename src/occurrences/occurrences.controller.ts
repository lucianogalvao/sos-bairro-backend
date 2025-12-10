import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OccurrencesService } from './occurrences.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateOcurrenceDto } from './dto/create-ocurrence.dto';
import { AuthenticatedUser } from 'src/types';
interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller('occurrences')
export class OccurrencesController {
  constructor(private readonly ocurrencesService: OccurrencesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() body: CreateOcurrenceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const residentId = req.user.id;
    return this.ocurrencesService.create(body, residentId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-occurrences')
  async findMine(@Req() req: AuthenticatedRequest) {
    const residentId = req.user.id;
    return this.ocurrencesService.findMine(residentId);
  }
}
