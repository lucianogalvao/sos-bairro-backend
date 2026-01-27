import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel } from '@prisma/client';

@Injectable()
export class OccurrenceCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.occurrenceCategory.findMany({
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.occurrenceCategory.findUnique({
      where: { id },
    });
  }

  create(data: { title: string; riskLevel: RiskLevel }) {
    return this.prisma.occurrenceCategory.create({
      data,
    });
  }
  async remove(id: number) {
    const category = await this.prisma.occurrenceCategory.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Categoria de ocorrência não encontrada.');
    }

    await this.prisma.occurrenceCategory.delete({
      where: { id },
    });
  }
}
