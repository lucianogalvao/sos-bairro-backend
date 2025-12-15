import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOcurrenceDto } from './dto/create-ocurrence.dto';
import { ListOccurrencesQueryDto } from './dto/list-occurrences.query';
import { OccurrenceStatus, Prisma } from '@prisma/client';
import { UpdateOccurrenceStatusDto } from './dto/update-occurence-status.dto';

@Injectable()
export class OccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateOcurrenceDto, residentId: number) {
    const category = await this.prisma.occurrenceCategory.findUnique({
      where: { id: createDto.categoryId },
    });

    if (!category) throw new Error('Categoria de ocorrência não encontrada');
    const ocurrence = await this.prisma.occurrence.create({
      data: {
        description: createDto.description,
        categoryId: createDto.categoryId,
        residentId,
        imageUrl: createDto.imageUrl,
        locationLatitude: createDto.locationLatitude,
        locationLongitude: createDto.locationLongitude,
      },
      include: {
        category: true,
        resident: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return ocurrence;
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
          resident: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    return {
      items,
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }

  async findOne(id: number) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
      include: {
        category: true,
        resident: {
          select: { id: true, name: true, email: true },
        },
        moderator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!occurrence) {
      throw new NotFoundException('Ocorrência não encontrada.');
    }

    return occurrence;
  }

  async updateStatus(id: number, dto: UpdateOccurrenceStatusDto) {
    const occurrence = await this.prisma.occurrence.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!occurrence) {
      throw new NotFoundException('Ocorrência não encontrada.');
    }

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
}
