import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  JwtAccessStrategy,
  jwtConfiguration,
  JwtRefreshStrategy,
} from './strategies';

@Module({
  imports: [ConfigModule.forRoot({ load: [jwtConfiguration] }), JwtModule], // moze wymagać JwtModule.register({})
  controllers: [AuthController],
  providers: [AuthService, JwtRefreshStrategy, JwtAccessStrategy],
  exports: [],
})
export class AuthModule {}
