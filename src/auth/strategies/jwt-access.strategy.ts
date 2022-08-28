import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../types';
import { UserEntity } from '../../models/users/entities';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.accessTokenSecret'),
      ignoreExpiration: true,
    });
  }

  async validate(payload: JwtPayload, done: (error, user) => void) {
    const expiationTimeStamp = payload.exp * 1000;
    if (expiationTimeStamp < Date.now()) {
      throw new ForbiddenException('Access token expired');
    }
    if (!payload || !payload.id) {
      throw new UnauthorizedException();
    }
    const user = await UserEntity.findOne({
      where: { id: payload.id },
      relations: ['favouriteAuthors'],
    });
    if (!user || user.status === 'pending') {
      return done(new UnauthorizedException(), false);
    }
    done(null, user);
  }
}
