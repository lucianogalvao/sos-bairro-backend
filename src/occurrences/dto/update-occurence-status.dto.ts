import { OccurrenceStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOccurrenceStatusDto {
  @IsEnum(OccurrenceStatus)
  status!: OccurrenceStatus;
}
