import { Role } from '@prisma/client';

export interface CreateUserParams {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}
