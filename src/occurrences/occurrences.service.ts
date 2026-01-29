import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOcurrenceDto } from './dto/create-ocurrence.dto';
import { ListOccurrencesQueryDto } from './dto/list-occurrences.dto';
import { OccurrenceStatus, Prisma } from '@prisma/client';
import { UpdateOccurrenceStatusDto } from './dto/update-occurence-status.dto';
import { AssignModeratorDto } from './dto/assign-moderator.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';
import { AuthenticatedUser } from 'src/types';

@Injectable()
export class OccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

  private isAdminOrModerator(user: AuthenticatedUser) {
    return user.role === 'ADMIN' || user.role === 'MODERADOR';
  }

  private isEditableStatus(status: OccurrenceStatus) {
    return (
      status === OccurrenceStatus.REGISTRADA ||
      status === OccurrenceStatus.EM_ANALISE
    );
  }

  async create(createDto: CreateOcurrenceDto, residentId: number) {
    const category = await this.prisma.occurrenceCategory.findUnique({
      where: { id: createDto.categoryId },
    });

    if (!category) throw new Error('Categoria de ocorrência não encontrada');

    return this.prisma.occurrence.create({
      data: {
        description: createDto.description,
        categoryId: createDto.categoryId,
        residentId,
        imageUrl: createDto.imageUrl,
        locationLatitude: createDto.locationLatitude,
        locationLongitude: createDto.locationLongitude,
        address: createDto.address,
      },
      include: {
        category: true,
        resident: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findMine(residentId: number) {
    return this.prisma.occurrence.findMany({
      where: { residentId },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }

  async findAll(query: ListOccurrencesQueryDto) {
    const where: Prisma.OccurrenceWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.categoryId !== undefined) where.categoryId = query.categoryId;

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const orderBy: Prisma.OccurrenceOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [totalItems, items] = await this.prisma.$transaction([
      this.prisma.occurrence.count({ where }),
      this.prisma.occurrence.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: true,
          resident: { select: { id: true, name: true, email: true } },
          moderator: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    return {
      items,
      meta: { page, pageSize, totalItems, totalPages },
    };
  }

  async findOne(id: number) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
      include: {
        category: true,
        resident: { select: { id: true, name: true, email: true } },
        moderator: { select: { id: true, name: true, email: true } },
      },
    });

    if (!occurrence) throw new NotFoundException('Ocorrência não encontrada.');
    return occurrence;
  }

  async updateStatus(id: number, dto: UpdateOccurrenceStatusDto) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!occurrence) throw new NotFoundException('Ocorrência não encontrada.');

    const current = occurrence.status;
    const next = dto.status;

    const allowedNext: Record<OccurrenceStatus, OccurrenceStatus[]> = {
      REGISTRADA: [OccurrenceStatus.EM_ANALISE],
      EM_ANALISE: [OccurrenceStatus.RESOLVIDA],
      RESOLVIDA: [],
    };

    if (current === next) {
      return this.prisma.occurrence.findUnique({
        where: { id },
        include: {
          category: true,
          resident: { select: { id: true, name: true, email: true } },
          moderator: { select: { id: true, name: true, email: true } },
        },
      });
    }

    if (!allowedNext[current].includes(next)) {
      throw new BadRequestException(
        `Transição de status inválida: ${current} → ${next}.`,
      );
    }

    return this.prisma.occurrence.update({
      where: { id },
      data: { status: next },
      include: {
        category: true,
        resident: { select: { id: true, name: true, email: true } },
        moderator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async assignModerator(id: number, dto: AssignModeratorDto) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
    });
    if (!occurrence) throw new NotFoundException('Ocorrência não encontrada.');

    const moderator = await this.prisma.user.findUnique({
      where: { id: dto.moderatorId },
    });
    if (!moderator) throw new NotFoundException('Moderador não encontrado.');

    return this.prisma.occurrence.update({
      where: { id },
      data: { moderatorId: dto.moderatorId },
      include: {
        category: true,
        resident: { select: { id: true, name: true, email: true } },
        moderator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async remove(id: number, user: AuthenticatedUser) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
      select: { id: true, residentId: true },
    });

    if (!occurrence) {
      throw new NotFoundException('Ocorrência não encontrada.');
    }

    const isOwner = occurrence.residentId === user.id;
    const isAdminOrMod = this.isAdminOrModerator(user);

    if (!isOwner && !isAdminOrMod) {
      throw new ForbiddenException('Você não pode excluir esta ocorrência.');
    }

    await this.prisma.occurrence.delete({ where: { id } });
  }

  async updateOccurrence(
    id: number,
    dto: UpdateOccurrenceDto,
    user: AuthenticatedUser,
  ) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
      select: { id: true, residentId: true, status: true },
    });

    if (!occurrence) throw new NotFoundException('Ocorrência não encontrada');

    if (!this.isEditableStatus(occurrence.status)) {
      throw new ForbiddenException(
        'Ocorrências resolvidas não podem ser editadas.',
      );
    }

    if (!this.isAdminOrModerator(user) && occurrence.residentId !== user.id) {
      throw new ForbiddenException('Você não pode editar esta ocorrência');
    }

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Nenhum campo para atualizar');
    }

    return this.prisma.occurrence.update({
      where: { id },
      data: {
        description: dto.description,
        categoryId: dto.categoryId,
        address: dto.address,
        locationLatitude: dto.locationLatitude,
        locationLongitude: dto.locationLongitude,
      },
      include: {
        category: true,
        resident: { select: { id: true, name: true, email: true } },
        moderator: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
