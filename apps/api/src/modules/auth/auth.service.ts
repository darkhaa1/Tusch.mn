import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { AuthDto } from './dto/register.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { randomUUID, randomBytes, createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private buildEmailVerificationToken() {
    const rawToken = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');
    const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return { rawToken, hashedToken, expiration };
  }

  async register(dto: AuthDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const { rawToken, hashedToken, expiration } =
      this.buildEmailVerificationToken();
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        accountType: dto.accountType,
        emailVerified: false,
        emailVerifyToken: hashedToken,
        emailVerifyTokenExp: expiration,
      },
    });

    console.log(
      `[auth] Email verification token for ${user.email}: ${rawToken}`,
    );

    const response: { token?: string } = {};
    if (process.env.NODE_ENV !== 'production') {
      response.token = rawToken;
    }

    return { ...this.sanitizeUser(user), ...response };
  }

  async login(body: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');
    if (user.deletedAt) {
      throw new UnauthorizedException('Бүртгэл устгагдсан байна');
    }

    const passwordValid = await bcrypt.compare(body.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      ...this.sanitizeUser(user),
      accessToken,
    };
  }

  async oauthLogin(body: OAuthLoginDto) {
    const placeholderPassword = await bcrypt.hash(randomUUID(), 10);

    const user = await this.prisma.user.upsert({
      where: { email: body.email },
      update: {
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        avatarUrl: body.avatarUrl,
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
      },
      create: {
        email: body.email,
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        avatarUrl: body.avatarUrl,
        password: placeholderPassword,
        phone: '',
        accountType: 'client',
        emailVerified: true,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      ...this.sanitizeUser(user),
      accessToken,
    };
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatarUrl?: string | null;
      accountType?: string;
      email?: string;
    },
  ) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return this.sanitizeUser(updated);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Unauthorized');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return this.sanitizeUser(updated);
  }

  async deleteUserById(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async deleteProfileAvatar(userId: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });
    return this.sanitizeUser(updated);
  }

  async forgotPassword(email: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // If user doesn't exist, just return success without doing anything
    if (!user) {
      return { success: true };
    }

    // Generate cryptographically secure random token (64 hex characters)
    const rawToken = randomBytes(32).toString('hex');

    // Hash token with SHA-256 before storing (never store raw token)
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');

    // Set expiration to 1 hour from now
    const expiration = new Date(Date.now() + 60 * 60 * 1000);

    // Update user with hashed token and expiration
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExp: expiration,
      },
    });

    // Return success with raw token only in development mode
    // In production, the token would be sent via email instead
    const response: { success: boolean; token?: string } = { success: true };
    if (process.env.NODE_ENV !== 'production') {
      response.token = rawToken;
    }

    return response;
  }

  async resetPassword(token: string, newPassword: string) {
    // Hash the incoming token to match against database
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // Find user with matching token that hasn't expired
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExp: {
          gt: new Date(), // Token expiration must be greater than now
        },
      },
    });

    // If no user found or token expired, throw error
    if (!user) {
      throw new UnauthorizedException('Токен буруу эсвэл хугацаа дууссан');
    }

    // Hash the new password with bcrypt (10 salt rounds, same as registration)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user: set new password and clear reset token fields
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return this.sanitizeUser(updated);
  }

  async verifyEmail(rawToken: string) {
    const hashedToken = createHash('sha256').update(rawToken).digest('hex');
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: hashedToken,
        emailVerifyTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Токен хүчингүй эсвэл хугацаа дууссан байна',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
      },
    });

    return { message: 'Имэйл амжилттай баталгаажлаа' };
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Имэйл аль хэдийн баталгаажсан байна');
    }

    const { rawToken, hashedToken, expiration } =
      this.buildEmailVerificationToken();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: hashedToken,
        emailVerifyTokenExp: expiration,
      },
    });

    console.log(
      `[auth] Email verification token for ${user.email}: ${rawToken}`,
    );

    const response: { message: string; token?: string } = {
      message: 'Баталгаажуулах холбоос дахин илгээгдлээ',
    };
    if (process.env.NODE_ENV !== 'production') {
      response.token = rawToken;
    }
    return response;
  }

  sanitizeUser(user: any) {
    const {
      password: _password,
      resetToken: _resetToken,
      resetTokenExp: _resetTokenExp,
      emailVerifyToken: _emailVerifyToken,
      emailVerifyTokenExp: _emailVerifyTokenExp,
      ...rest
    } = user;
    void _password;
    void _resetToken;
    void _resetTokenExp;
    void _emailVerifyToken;
    void _emailVerifyTokenExp;
    return rest;
  }
}
