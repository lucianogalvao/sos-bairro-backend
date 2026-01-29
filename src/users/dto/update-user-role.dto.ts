import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: Role,
    example: 'MODERADOR',
    description: 'Novo papel do usuário no sistema',
  })
  @IsEnum(Role)
  role!: Role;
}
