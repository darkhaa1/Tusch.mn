import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminRole } from '@repo/shared';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createContext = (
    userAdminRole: string | null,
    requiredRoles: AdminRole[],
  ) => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user:
            userAdminRole !== null
              ? { id: '1', email: 'test@example.com', adminRole: userAdminRole }
              : null,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('autorise si pas de roles requis', () => {
    const ctx = createContext(AdminRole.USER, []);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('autorise un ADMIN sur route admin', () => {
    const ctx = createContext(AdminRole.ADMIN, [AdminRole.ADMIN]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('autorise un MODERATOR sur route admin+mod', () => {
    const ctx = createContext(AdminRole.MODERATOR, [
      AdminRole.ADMIN,
      AdminRole.MODERATOR,
    ]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('refuse un USER sur route admin', () => {
    const ctx = createContext(AdminRole.USER, [
      AdminRole.ADMIN,
      AdminRole.MODERATOR,
    ]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('refuse si non authentifié', () => {
    const ctx = createContext(null, [AdminRole.ADMIN]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
