import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { AuthDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { randomUUID } from 'crypto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: AuthDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        accountType: dto.accountType,
      },
    });

    return this.sanitizeUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 🔒 Check if user is suspended before allowing login
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Account is suspended. Please contact support.',
      );
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 🔒 JWT with explicit expiration (15 minutes)
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        isAdmin: user.isAdmin, // 🔒 Include in token to avoid DB query in guards
      },
      {
        expiresIn: '15m', // 🔒 Short-lived access token
      },
    );

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
      },
      create: {
        email: body.email,
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        avatarUrl: body.avatarUrl,
        password: placeholderPassword,
        phone: '',
        accountType: 'client',
      },
    });

    // 🔒 Check if user is suspended
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Account is suspended. Please contact support.',
      );
    }

    // 🔒 JWT with explicit expiration
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      {
        expiresIn: '15m',
      },
    );

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
      // 🔒 Email removed - should be separate endpoint with verification
    },
  ) {
    // 🔒 Explicitly whitelist fields to prevent mass assignment
    const allowedData: any = {};
    if (data.firstName !== undefined) allowedData.firstName = data.firstName;
    if (data.lastName !== undefined) allowedData.lastName = data.lastName;
    if (data.phone !== undefined) allowedData.phone = data.phone;
    if (data.avatarUrl !== undefined) allowedData.avatarUrl = data.avatarUrl;
    if (data.accountType !== undefined)
      allowedData.accountType = data.accountType;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: allowedData,
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
    return this.prisma.user.delete({ where: { id } });
  }

  async deleteProfileAvatar(userId: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });
    return this.sanitizeUser(updated);
  }

  sanitizeUser(user: any) {
    const { password: _password, ...rest } = user;
    void _password;
    return rest;
  }
}
