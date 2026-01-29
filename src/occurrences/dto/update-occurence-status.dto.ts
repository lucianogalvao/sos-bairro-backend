import { OccurrenceStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOccurrenceStatusDto {
  @ApiProperty({
    example: OccurrenceStatus.REGISTRADA,
    enum: OccurrenceStatus,
    description: 'Novo status da ocorrência',
  })
  @IsEnum(OccurrenceStatus)
  status!: OccurrenceStatus;
}
