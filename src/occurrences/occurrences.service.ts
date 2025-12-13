import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOcurrenceDto } from './dto/create-ocurrence.dto';
import { ListOccurrencesQueryDto } from './dto/list-occurrences.query';
import { Prisma } from '@prisma/client';

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
    return this.prisma.occurrence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
  }
}
