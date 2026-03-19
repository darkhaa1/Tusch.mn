import { Request } from 'express';
import { AdminRole } from '@repo/shared';

export interface JwtUser {
  id: string;
  email: string;
  adminRole: AdminRole;
}

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}
