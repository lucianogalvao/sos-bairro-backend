import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OccurrenceStatus, Prisma, RiskLevel } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const total = await this.prisma.occurrence.count();

    const byStatusRaw = await this.prisma.occurrence.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const byRiskRaw = await this.prisma.occurrence.findMany({
      select: {
        category: { select: { riskLevel: true } },
      },
    });

    const byStatus: Record<OccurrenceStatus, number> = {
      REGISTRADA: 0,
      EM_ANALISE: 0,
      RESOLVIDA: 0,
    };

    byStatusRaw.forEach((item) => {
      byStatus[item.status] = item._count.status;
    });

    const byRisk: Record<RiskLevel, number> = {
      ALTO: 0,
      MEDIO: 0,
      BAIXO: 0,
    };

    byRiskRaw.forEach((item) => {
      const risk = item.category.riskLevel;
      byRisk[risk]++;
    });

    return {
      total,
      byStatus,
      byRisk,
    };
  }

  async byCategory() {
    const data = await this.prisma.occurrence.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true },
    });

    const categories = await this.prisma.occurrenceCategory.findMany({
      where: { id: { in: data.map((d) => d.categoryId) } },
    });

    return data.map((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      return {
        category: category?.title ?? 'Desconhecida',
        total: item._count.categoryId,
      };
    });
  }

  async byDate(from?: string, to?: string) {
    const where: Prisma.OccurrenceWhereInput = {};

    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const data = await this.prisma.occurrence.groupBy({
      by: ['createdAt'],
      where,
      _count: { createdAt: true },
    });

    return data.map((item) => ({
      date: item.createdAt.toISOString().split('T')[0],
      total: item._count.createdAt,
    }));
  }
}
