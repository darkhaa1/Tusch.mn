import { Request } from 'express';

export interface JwtUser {
  id: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}
