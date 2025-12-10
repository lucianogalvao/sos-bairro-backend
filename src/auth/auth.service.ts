/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) throw new Error('E-mail já está em uso.');

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.usersService.createUser({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async login(data: LoginDto) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) throw new Error('Credenciais inválidas.');

    const valid = await bcrypt.compare(data.password, user.passwordHash);

    if (!valid) throw new Error('Credenciais inválidas.');

    console.log('user =>', user);

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    console.log('payload =>', payload);

    const token = await this.jwt.signAsync(payload);

    const { passwordHash: _, ...safeUser } = user;
    console.log('novo user =>', user);
    return {
      user: safeUser,
      token,
    };
  }
}
