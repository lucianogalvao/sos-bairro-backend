import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Maria da Silva',
    description: 'Nome completo do usuário',
  })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'maria.silva@email.com',
    description: 'Email válido do usuário',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha do usuário (mínimo de 6 caracteres)',
    minLength: 6,
  })
  @MinLength(6)
  password!: string;
}
