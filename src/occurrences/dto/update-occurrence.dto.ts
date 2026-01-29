import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOccurrenceDto {
  @ApiPropertyOptional({
    example: 'Som alto durante a madrugada',
    description: 'Descrição atualizada da ocorrência',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'ID da nova categoria da ocorrência',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({
    example: 'Rua das Flores, 123 - Centro',
    description: 'Endereço atualizado da ocorrência',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({
    example: -23.55052,
    description: 'Latitude da ocorrência',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  locationLatitude?: number;

  @ApiPropertyOptional({
    example: -46.633308,
    description: 'Longitude da ocorrência',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  locationLongitude?: number;
}
