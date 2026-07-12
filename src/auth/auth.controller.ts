import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedAdmin } from './types/authenticated-admin.type';

const REFRESH_COOKIE_NAME = 'wood_refresh_token';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in as an administrator',
  })
  @ApiOkResponse({
    description: 'Administrator logged in successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent')
    userAgent: string | undefined,
    @Ip() ipAddress: string,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const result = await this.authService.login(loginDto, {
      userAgent,
      ipAddress,
    });

    this.setRefreshCookie(
      response,
      result.refreshToken,
      result.refreshCookieMaxAge,
    );

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        admin: result.admin,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create a new access token using the refresh cookie',
  })
  @ApiOkResponse({
    description: 'Authentication tokens refreshed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, expired, or revoked refresh token',
  })
  async refresh(
    @Req() request: Request,
    @Headers('user-agent')
    userAgent: string | undefined,
    @Ip() ipAddress: string,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const refreshToken = this.getRequiredRefreshToken(request);

    const result = await this.authService.refresh(refreshToken, {
      userAgent,
      ipAddress,
    });

    this.setRefreshCookie(
      response,
      result.refreshToken,
      result.refreshCookieMaxAge,
    );

    return {
      success: true,
      message: 'Authentication tokens refreshed successfully',
      data: {
        accessToken: result.accessToken,
        admin: result.admin,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log out and revoke the active refresh session',
  })
  @ApiOkResponse({
    description: 'Administrator logged out successfully',
  })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const refreshToken = this.getRefreshToken(request);

    await this.authService.logout(refreshToken);

    response.clearCookie(REFRESH_COOKIE_NAME, this.getCookieOptions());

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get the authenticated administrator',
  })
  @ApiOkResponse({
    description: 'Authenticated administrator information',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, expired, or invalid access token',
  })
  getCurrentAdmin(
    @CurrentAdmin()
    admin: AuthenticatedAdmin,
  ) {
    return {
      success: true,
      message: 'Authenticated administrator retrieved successfully',
      data: {
        admin,
      },
    };
  }

  private getRequiredRefreshToken(request: Request): string {
    const token = this.getRefreshToken(request);

    if (!token) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    return token;
  }

  private getRefreshToken(request: Request): string | undefined {
    const cookies: unknown = request.cookies;

    if (typeof cookies !== 'object' || cookies === null) {
      return undefined;
    }

    const token = (cookies as Record<string, unknown>)[REFRESH_COOKIE_NAME];

    return typeof token === 'string' ? token : undefined;
  }

  private setRefreshCookie(
    response: Response,
    refreshToken: string,
    maxAge: number,
  ): void {
    response.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      this.getCookieOptions(maxAge),
    );
  }

  private getCookieOptions(maxAge?: number): CookieOptions {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/api/v1/auth',
      ...(maxAge !== undefined ? { maxAge } : {}),
    };
  }
}
