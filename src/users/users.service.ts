import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserParams } from 'src/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  createUser(params: CreateUserParams) {
    const { name, email, passwordHash, role } = params;
    return this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role ?? 'MORADOR',
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
  }
}
