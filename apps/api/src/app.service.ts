import { Injectable } from "@nestjs/common";
import type { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getUsers() {
    return this.prisma.user.findMany();
  }
}
