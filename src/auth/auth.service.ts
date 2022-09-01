import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto';
import { UserEntity } from '../models/users/entities';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcrypt';
import {
  AuthLoginResponse,
  AuthRefreshResponse,
  JwtPayload,
  Tokens,
  UserStatus,
} from '../types';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  filter({
    id,
    email,
    username,
    avatarURL,
    favouriteAuthors,
    role,
  }: UserEntity) {
    const favouriteAuthorsUsernames = favouriteAuthors.map(
      (favAuthor) => favAuthor.username,
    );
    return {
      id,
      email,
      username,
      avatarURL,
      role,
      favouriteAuthors: favouriteAuthorsUsernames,
    };
  }

  async login(
    { email, password }: LoginDto,
    res: Response,
  ): Promise<AuthLoginResponse> {
    const user = await UserEntity.findOne({
      where: { email },
      relations: ['favouriteAuthors'],
    });
    if (!user) {
      throw new BadRequestException('Wrong email or password');
    }
    const pwdMatch = await compare(password, user.password);
    if (!pwdMatch) {
      throw new BadRequestException('Wrong email or password');
    }
    if (user.status === UserStatus.PENDING) {
      throw new UnauthorizedException('Account is not verified yet.');
    }
    const { accessToken, refreshToken } = await this.getNewTokens({
      id: user.id,
      email,
    });
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('jwt-refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      success: true,
      data: {
        user: this.filter(user),
        accessToken,
      },
    };
  }

  async refresh(user: UserEntity, res: Response): Promise<AuthRefreshResponse> {
    const { accessToken, refreshToken } = await this.getNewTokens({
      id: user.id,
      email: user.email,
    });
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('jwt-refresh', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      success: true,
      data: {
        user: this.filter(user),
        accessToken,
      },
    };
  }

  async logout(user: UserEntity, res: Response): Promise<any> {
    user.refreshToken = null;
    await user.save();
    res.clearCookie('jwt-refresh', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return { success: true };
  }

  async getNewTokens(payload: JwtPayload): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.accessTokenSecret'),
        expiresIn: '15min',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshTokenSecret'),
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
