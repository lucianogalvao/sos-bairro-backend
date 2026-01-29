import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignModeratorDto {
  @ApiProperty({
    example: 3,
    description:
      'ID do usuário que será designado como moderador da ocorrência',
  })
  @IsInt()
  moderatorId!: number;
}
