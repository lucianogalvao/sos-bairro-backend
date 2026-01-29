import { OccurrenceStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OccurrenceSortBy {
  CREATED_AT = 'createdAt',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListOccurrencesQueryDto {
  @ApiPropertyOptional({
    example: 'OPEN',
    enum: OccurrenceStatus,
    description: 'Filtra ocorrências pelo status',
  })
  @IsOptional()
  @IsEnum(OccurrenceStatus)
  status?: OccurrenceStatus;

  @ApiPropertyOptional({
    example: 3,
    description: 'Filtra ocorrências por categoria',
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Data inicial para filtro (ISO 8601)',
  })
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2026-01-31T23:59:59.999Z',
    description: 'Data final para filtro (ISO 8601)',
  })
  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @ApiPropertyOptional({
    example: OccurrenceSortBy.CREATED_AT,
    enum: OccurrenceSortBy,
    description: 'Campo utilizado para ordenação',
  })
  @IsOptional()
  @IsEnum(OccurrenceSortBy)
  sortBy?: OccurrenceSortBy;

  @ApiPropertyOptional({
    example: SortOrder.DESC,
    enum: SortOrder,
    description: 'Ordem da ordenação',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({
    example: 1,
    description: 'Página atual (paginação)',
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 1))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade de registros por página (máx: 50)',
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 10))
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize: number = 10;
}
