import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { OAuthLoginDto } from './dto/oauth-login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private userService: UserService) { }

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
  }) {
    const existing = await this.userService.findByEmail(body.email);
    if (existing) throw new BadRequestException("Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна");

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await this.userService.createUser({
      email: body.email,
      password: passwordHash,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      accountType: body.accountType,
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      id: user.id,
      email: user.email,
      accessToken,
    };
  }

  async login(body: { email: string; password: string; }) {
    const user = await this.userService.findByEmail(body.email);
    if (!user) throw new UnauthorizedException('Имэйл буруу байна');

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Нууц үг буруу байна');

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
      accessToken,
    };
  }

  async oauthLogin(dto: OAuthLoginDto) {
    const { email, firstName, lastName, provider } = dto;

    // 1) chercher user par email
    let user = await this.userService.findByEmail(email);

    // 2) si pas trouvé -> créer un user "social"
    if (!user) {
      user = await this.userService.createUser({

        email,
        password: 'oauth',          // tu peux mettre un placeholder, pas utilisé
        firstName: firstName || 'Google',
        lastName: lastName || 'User',
        phone: '',
        accountType: provider || 'google',

      });
    }

    // 3) signer un JWT classique
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      id: user.id,
      email: user.email,
      accessToken,
    };
  }
}
