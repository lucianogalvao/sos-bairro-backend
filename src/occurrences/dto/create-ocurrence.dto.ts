import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOcurrenceDto {
  @ApiProperty({
    example: 'Assalto próximo à praça central',
    description: 'Descrição detalhada da ocorrência',
  })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({
    example: 2,
    description: 'ID da categoria da ocorrência',
  })
  @IsInt()
  categoryId!: number;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/app/image/upload/v1/ocorrencias/assalto.jpg',
    description: 'Imagem associada à ocorrência (opcional)',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: -27.5969,
    description: 'Latitude da localização da ocorrência',
  })
  @IsOptional()
  @IsNumber()
  locationLatitude?: number;

  @ApiPropertyOptional({
    example: -48.5495,
    description: 'Longitude da localização da ocorrência',
  })
  @IsOptional()
  @IsNumber()
  locationLongitude?: number;

  @ApiPropertyOptional({
    example: 'Rua das Acácias, 120 - Centro',
    description: 'Endereço textual da ocorrência',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
