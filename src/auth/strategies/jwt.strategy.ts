import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminsService } from '../../admins/admins.service';
import { AuthenticatedAdmin } from '../types/authenticated-admin.type';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly adminsService: AdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedAdmin> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }

    const admin = await this.adminsService.findActiveById(payload.sub);

    if (!admin) {
      throw new UnauthorizedException('Administrator account is unavailable');
    }

    return {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
    };
  }
}
