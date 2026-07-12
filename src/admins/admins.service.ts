import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.admin.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  findActiveById(id: string) {
    return this.prisma.admin.findFirst({
      where: {
        id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
      },
    });
  }

  updateLastLogin(id: string) {
    return this.prisma.admin.update({
      where: {
        id,
      },
      data: {
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        lastLoginAt: true,
      },
    });
  }
}
