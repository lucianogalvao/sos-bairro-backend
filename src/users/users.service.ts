import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserParams } from 'src/types';

type UpdateUserParams = {
  name?: string;
  email?: string;
  address?: string | null;
  avatarUrl?: string | null;
};

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

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async updateRole(userId: number, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException(
        'Usuários ADMIN não podem ter o papel alterado.',
      );
    }

    if (role === Role.ADMIN) {
      throw new BadRequestException(
        'Não é permitido promover usuários para ADMIN por esta rota.',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(userId: number, dto: UpdateUserParams) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      const name = String(dto.name).trim();
      if (!name) throw new BadRequestException('Nome inválido.');
      data.name = name;
    }

    if (dto.email !== undefined) {
      const email = String(dto.email).trim().toLowerCase();
      if (!email) throw new BadRequestException('Email inválido.');

      const emailInUse = await this.prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
        select: { id: true },
      });

      if (emailInUse) {
        throw new BadRequestException('Este e-mail já está em uso.');
      }

      data.email = email;
    }

    if (dto.address !== undefined) {
      const address =
        dto.address == null ? null : String(dto.address).trim() || null;
      data.address = address;
    }

    if (dto.avatarUrl !== undefined) {
      const avatarUrl =
        dto.avatarUrl == null ? null : String(dto.avatarUrl).trim() || null;
      data.avatarUrl = avatarUrl;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nenhum campo para atualizar.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        address: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
