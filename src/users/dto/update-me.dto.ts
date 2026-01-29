import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value == null) return null; // <-- aqui
    return String(value).trim();
  })
  @IsUrl({}, { message: 'avatarUrl must be a URL address' })
  avatarUrl?: string | null;
}
