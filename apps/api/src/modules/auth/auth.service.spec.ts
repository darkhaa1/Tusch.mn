import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { EmailService } from '../email/email.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';

jest.mock('bcrypt');

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
};

const mockFirebaseService = {
  isEnabled: jest.fn().mockReturnValue(false),
  verifyIdToken: jest.fn().mockResolvedValue(null),
  getUserByPhone: jest.fn().mockResolvedValue(null),
  deleteFirebaseUser: jest.fn().mockResolvedValue(undefined),
};

const mockEmailService = {
  isEnabled: jest.fn().mockReturnValue(false),
  sendEmailVerification: jest.fn().mockResolvedValue(undefined),
  sendPasswordReset: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ─── register ───────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '12345678',
      accountType: 'basic',
      acceptedTerms: true,
    };

    it('should hash password and create user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        accountType: dto.accountType,
        emailVerified: false,
        password: 'hashed-pw',
        emailVerifyToken: 'hashed-token',
        emailVerifyTokenExp: new Date(),
      });

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(result.email).toBe(dto.email);
      // password should be sanitized out
      expect((result as any).password).toBeUndefined();
    });

    it('should return token in non-production env', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: 'hashed-pw',
        emailVerifyToken: 'tok',
        emailVerifyTokenExp: new Date(),
      });

      const result = await service.register(dto);
      expect(result.token).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  // ─── login ──────────────────────────────────────────────────────────

  describe('login', () => {
    const credentials = { email: 'test@example.com', password: 'password123' };

    it('should return user with accessToken on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: credentials.email,
        password: 'hashed',
        deletedAt: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(credentials);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect((result as any).password).toBeUndefined();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: credentials.email,
        password: 'hashed',
        deletedAt: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for deleted user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: credentials.email,
        password: 'hashed',
        deletedAt: new Date(),
      });

      await expect(service.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── oauthLogin ─────────────────────────────────────────────────────

  describe('oauthLogin', () => {
    it('should upsert user and return accessToken', async () => {
      const dto = {
        email: 'oauth@example.com',
        firstName: 'OAuth',
        lastName: 'User',
        avatarUrl: 'https://example.com/avatar.png',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.upsert.mockResolvedValue({
        id: 'user-1',
        ...dto,
        password: 'hashed',
      });

      const result = await service.oauthLogin(dto);

      expect(prisma.user.upsert).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toBe('mock-jwt-token');
      expect((result as any).password).toBeUndefined();
    });
  });

  // ─── updateProfile ──────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should update and return sanitized user', async () => {
      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        firstName: 'New',
        lastName: 'Name',
        password: 'hashed',
      });

      const result = await service.updateProfile('user-1', {
        firstName: 'New',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { firstName: 'New' },
      });
      expect(result.firstName).toBe('New');
      expect((result as any).password).toBeUndefined();
    });
  });

  // ─── changePassword ─────────────────────────────────────────────────

  describe('changePassword', () => {
    it('should change password when current password is valid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'old-hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');
      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        password: 'new-hashed',
      });

      const result = await service.changePassword('user-1', 'old', 'new');

      expect(bcrypt.compare).toHaveBeenCalledWith('old', 'old-hashed');
      expect(bcrypt.hash).toHaveBeenCalledWith('new', 10);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw when current password is invalid', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', 'wrong', 'new'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('user-1', 'old', 'new'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── deleteUserById ─────────────────────────────────────────────────

  describe('deleteUserById', () => {
    it('should soft-delete user', async () => {
      prisma.user.update.mockResolvedValue({ id: 'user-1', deletedAt: new Date() });

      await service.deleteUserById('user-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  // ─── forgotPassword ─────────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('should return success even if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@test.com');

      expect(result.success).toBe(true);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should generate token and update user when user exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'a@b.com' });
      prisma.user.update.mockResolvedValue({});

      const result = await service.forgotPassword('a@b.com');

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          resetToken: expect.any(String),
          resetTokenExp: expect.any(Date),
        },
      });
    });
  });

  // ─── resetPassword ──────────────────────────────────────────────────

  describe('resetPassword', () => {
    it('should throw when token is invalid or expired', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword('bad-token', 'new')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should update password and clear reset token', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed');
      prisma.user.update.mockResolvedValue({
        id: 'user-1',
        password: 'new-hashed',
        resetToken: null,
        resetTokenExp: null,
      });

      const result = await service.resetPassword('valid-token', 'newpassword');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          password: 'new-hashed',
          resetToken: null,
          resetTokenExp: null,
        },
      });
      expect((result as any).password).toBeUndefined();
    });
  });

  // ─── verifyEmail ────────────────────────────────────────────────────

  describe('verifyEmail', () => {
    it('should throw BadRequestException for invalid token', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.verifyEmail('bad')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should verify email and clear token', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
      prisma.user.update.mockResolvedValue({});

      const result = await service.verifyEmail('valid-token');

      expect(result.message).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          emailVerified: true,
          emailVerifyToken: null,
          emailVerifyTokenExp: null,
        },
      });
    });
  });

  // ─── resendVerification ─────────────────────────────────────────────

  describe('resendVerification', () => {
    it('should throw when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.resendVerification('x')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw when email already verified', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        emailVerified: true,
      });

      await expect(service.resendVerification('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should generate new token when email not verified', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        emailVerified: false,
      });
      prisma.user.update.mockResolvedValue({});

      const result = await service.resendVerification('user-1');

      expect(result.message).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  // ─── sanitizeUser ───────────────────────────────────────────────────

  describe('sanitizeUser', () => {
    it('should strip sensitive fields', () => {
      const user = {
        id: 'user-1',
        email: 'a@b.com',
        password: 'hash',
        resetToken: 'tok',
        resetTokenExp: new Date(),
        emailVerifyToken: 'tok2',
        emailVerifyTokenExp: new Date(),
      };

      const sanitized = service.sanitizeUser(user);

      expect(sanitized.id).toBe('user-1');
      expect(sanitized.email).toBe('a@b.com');
      expect((sanitized as any).password).toBeUndefined();
      expect((sanitized as any).resetToken).toBeUndefined();
      expect((sanitized as any).resetTokenExp).toBeUndefined();
      expect((sanitized as any).emailVerifyToken).toBeUndefined();
      expect((sanitized as any).emailVerifyTokenExp).toBeUndefined();
    });
  });
});
