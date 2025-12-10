import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthenticatedUser } from 'src/types';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getMe(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
