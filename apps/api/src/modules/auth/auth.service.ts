import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { AuthDto } from './dto/register.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { randomUUID } from 'crypto';

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

  async login(body: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid credentials');

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
