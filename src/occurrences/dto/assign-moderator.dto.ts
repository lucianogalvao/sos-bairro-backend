import { IsInt } from 'class-validator';

export class AssignModeratorDto {
  @IsInt()
  moderatorId!: number;
}
