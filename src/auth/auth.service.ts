import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { AdminsService } from '../admins/admins.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import type { AuthenticatedAdmin } from './types/authenticated-admin.type';
import type { JwtPayload, RefreshJwtPayload } from './types/jwt-payload.type';

type AuthContext = {
  userAgent?: string;
  ipAddress?: string;
};

type AuthResult = {
  accessToken: string;
  refreshToken: string;
  refreshCookieMaxAge: number;
  admin: AuthenticatedAdmin;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  refreshExpirationSeconds: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, context: AuthContext): Promise<AuthResult> {
    const admin = await this.adminsService.findByEmail(loginDto.email);

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordIsValid = await argon2.verify(
      admin.passwordHash,
      loginDto.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const safeAdmin: AuthenticatedAdmin = {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
    };

    const sessionId = randomUUID();

    const tokens = await this.createTokenPair(safeAdmin, sessionId);

    const refreshTokenHash = await argon2.hash(tokens.refreshToken);

    const expiresAt = new Date(
      Date.now() + tokens.refreshExpirationSeconds * 1000,
    );

    await this.prisma.$transaction([
      this.prisma.refreshSession.create({
        data: {
          id: sessionId,
          adminId: admin.id,
          tokenHash: refreshTokenHash,
          userAgent: context.userAgent,
          ipAddress: context.ipAddress,
          expiresAt,
        },
      }),

      this.prisma.admin.update({
        where: {
          id: admin.id,
        },
        data: {
          lastLoginAt: new Date(),
        },
      }),
    ]);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      refreshCookieMaxAge: tokens.refreshExpirationSeconds * 1000,
      admin: safeAdmin,
    };
  }

  async refresh(
    refreshToken: string,
    context: AuthContext,
  ): Promise<AuthResult> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const session = await this.prisma.refreshSession.findUnique({
      where: {
        id: payload.sid,
      },
    });

    if (
      !session ||
      session.adminId !== payload.sub ||
      session.revokedAt !== null ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('Refresh session is invalid or expired');
    }

    let tokenMatches = false;

    try {
      tokenMatches = await argon2.verify(session.tokenHash, refreshToken);
    } catch {
      tokenMatches = false;
    }

    if (!tokenMatches) {
      await this.revokeSession(session.id);

      throw new UnauthorizedException('Refresh token is invalid');
    }

    const admin = await this.adminsService.findActiveById(payload.sub);

    if (!admin) {
      await this.revokeSession(session.id);

      throw new UnauthorizedException('Administrator account is unavailable');
    }

    const safeAdmin: AuthenticatedAdmin = {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
    };

    const newTokens = await this.createTokenPair(safeAdmin, session.id);

    const newRefreshTokenHash = await argon2.hash(newTokens.refreshToken);

    const newExpiresAt = new Date(
      Date.now() + newTokens.refreshExpirationSeconds * 1000,
    );

    const updateResult = await this.prisma.refreshSession.updateMany({
      where: {
        id: session.id,
        tokenHash: session.tokenHash,
        revokedAt: null,
      },
      data: {
        tokenHash: newRefreshTokenHash,
        userAgent: context.userAgent ?? session.userAgent,
        ipAddress: context.ipAddress ?? session.ipAddress,
        expiresAt: newExpiresAt,
      },
    });

    if (updateResult.count !== 1) {
      throw new UnauthorizedException('Refresh token has already been used');
    }

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      refreshCookieMaxAge: newTokens.refreshExpirationSeconds * 1000,
      admin: safeAdmin,
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = await this.verifyRefreshToken(refreshToken, true);

      await this.prisma.refreshSession.updateMany({
        where: {
          id: payload.sid,
          adminId: payload.sub,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch {
      // Logout remains successful even when the
      // cookie is already invalid or expired.
    }
  }

  private async createTokenPair(
    admin: AuthenticatedAdmin,
    sessionId: string,
  ): Promise<TokenPair> {
    const accessSecret =
      this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');

    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessExpirationSeconds = this.durationToSeconds(
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    );

    const refreshExpirationSeconds = this.durationToSeconds(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    );

    const accessPayload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      type: 'access',
    };

    const refreshPayload: RefreshJwtPayload = {
      sub: admin.id,
      email: admin.email,
      sid: sessionId,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessExpirationSeconds,
        algorithm: 'HS256',
      }),

      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpirationSeconds,
        algorithm: 'HS256',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      refreshExpirationSeconds,
    };
  }

  private async verifyRefreshToken(
    token: string,
    ignoreExpiration = false,
  ): Promise<RefreshJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<
        Record<string, unknown>
      >(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        algorithms: ['HS256'],
        ignoreExpiration,
      });

      if (!this.isRefreshJwtPayload(payload)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private isRefreshJwtPayload(
    payload: Record<string, unknown>,
  ): payload is RefreshJwtPayload {
    return (
      typeof payload.sub === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.sid === 'string' &&
      payload.type === 'refresh'
    );
  }

  private async revokeSession(sessionId: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  private durationToSeconds(value: string): number {
    const match = /^(\d+)(s|m|h|d)$/i.exec(value.trim());

    if (!match) {
      throw new Error(`Invalid token duration: ${value}`);
    }

    const amountText = match[1];
    const unit = match[2]?.toLowerCase();

    if (!amountText || !unit) {
      throw new Error(`Invalid token duration: ${value}`);
    }

    const amount = Number(amountText);

    switch (unit) {
      case 's':
        return amount;

      case 'm':
        return amount * 60;

      case 'h':
        return amount * 60 * 60;

      case 'd':
        return amount * 60 * 60 * 24;

      default:
        throw new Error(`Unsupported token duration: ${value}`);
    }
  }
}
