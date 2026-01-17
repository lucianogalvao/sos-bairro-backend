import { ApiProperty } from '@nestjs/swagger';
import { RiskLevel } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateOccurrenceCategoryDto {
  @ApiProperty({ example: 'Roubo' })
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty({ enum: RiskLevel, example: RiskLevel.ALTO })
  @IsEnum(RiskLevel)
  riskLevel!: RiskLevel;
}
