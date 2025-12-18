import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { OAuthLoginDto } from './dto/oauth-login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private userService: UserService) { }

  sanitizeUser(user: any) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getUserById(id: string) {
    return this.userService.findById(id); // Should return a user or null/undefined
  }

  async register(body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    accountType: string;
    avatarUrl?: string | null;
  }) {
    const existing = await this.userService.findByEmail(body.email);
    if (existing) throw new BadRequestException("Энэ и-мэйл аль хэдийн бүртгэлтэй байна.");

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await this.userService.createUser({
      email: body.email,
      password: passwordHash,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      accountType: body.accountType,
      avatarUrl: body.avatarUrl || null,
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      firstname: user.firstName,
      lastname: user.lastName,
      phone: user.phone,
      accountType: user.accountType,
    });

    return {
      id: user.id,
      email: user.email,
      avatarUrl: user.avatarUrl,
      accessToken,
    };
  }

  async login(body: { email: string; password: string }) {
    const user = await this.userService.findByEmail(body.email);
    if (!user) throw new UnauthorizedException('Имэйл эсвэл нууц үг буруу байна.');

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Имэйл эсвэл нууц үг буруу байна.');

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      firstname: user.firstName,
      lastname: user.lastName,
      phone: user.phone,
      accountType: user.accountType,
    });
    return {
      id: user.id,
      email: user.email,
      avatarUrl: user.avatarUrl,
      accessToken,
    };
  }

  async oauthLogin(dto: OAuthLoginDto & { avatarUrl?: string | null }) {
    const { email, firstName, lastName, provider, avatarUrl } = dto;

    // 1) chercher user par email
    let user = await this.userService.findByEmail(email);

    // 2) si pas trouvAc -> crAcer un user "social"
    if (!user) {
      user = await this.userService.createUser({
        email,
        password: 'oauth', // placeholder, not used
        firstName: firstName || 'Google',
        lastName: lastName || 'User',
        phone: '',
        accountType: provider || 'google',
        avatarUrl: avatarUrl || null,
      });
    } else if (avatarUrl && user.avatarUrl !== avatarUrl) {
      // refresh avatar from provider if it changed
      user = await this.userService.updateUser(user.id, { avatarUrl });
    }

    // 3) signer un JWT classique
    const payload = {
      sub: user.id,
      email: user.email,
      firstname: user.firstName,
      lastname: user.lastName,
      phone: user.phone,
      accountType: user.accountType,
      avatarUrl: user.avatarUrl,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      id: user.id,
      email: user.email,
      avatarUrl: user.avatarUrl,
      accessToken,
    };
  }

  async updateProfile(
    userId: string,
    data: Partial<{ firstName: string; lastName: string; phone: string; avatarUrl: string; accountType: string }>
  ) {
    const updated = await this.userService.updateUser(userId, {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      accountType: data.accountType,
    });

    return this.sanitizeUser(updated);
  }

  async deleteUserById(userId: string) {
    const existing = await this.getUserById(userId);
    if (!existing) throw new NotFoundException('User not found');
    return this.userService.deleteUser(userId);
  }
}
