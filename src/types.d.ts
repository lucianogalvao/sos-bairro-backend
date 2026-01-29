import { Role } from '@prisma/client';

export interface CreateUserParams {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
}

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: Role;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
      role: Role;
    }

    interface Request {
      user?: User;
    }
  }
}
