import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthDto } from '../auth/dto/register.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    accountType: string;
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  async create(data: AuthDto) {
    const { password, firstName, lastName, phone, accountType, ...rest } = data as any;

    return this.prisma.user.create({
      data: {
        ...rest,
        password,
        firstName,
        lastName,
        phone,
        accountType,
      },
    });
  }
}
