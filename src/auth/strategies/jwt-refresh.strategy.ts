import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../types';
import { UserEntity } from '../../models/users/entities';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const refreshToken = req?.cookies?.['jwt-refresh'];
          return refreshToken ? refreshToken : null;
        },
      ]),
      secretOrKey: configService.get('jwt.refreshTokenSecret'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: JwtPayload,
    done: (error, user) => void,
  ) {
    if (!payload || !payload.id) {
      return done(new UnauthorizedException(), false);
    }
    const refreshToken = req?.cookies?.['jwt-refresh'];
    const user = await UserEntity.findOneBy({ id: payload.id });
    if (!user || user.refreshToken !== refreshToken) {
      return done(new UnauthorizedException(), false);
    }
    done(null, user);
  }
}
