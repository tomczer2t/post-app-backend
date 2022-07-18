import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto';
import { AuthService } from './auth.service';
import { AuthLoginResponse, AuthRefreshResponse } from '../types';
import { Response } from 'express';
import { AccessGuard, RefreshGuard, StatusGuard } from '../common/guards';
import { UserEntity } from '../models/users/entities';
import { GetCurrentUser, UsePublic } from '../common/decorators';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePublic()
  @UseGuards(StatusGuard)
  @Post('/login')
  login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ): Promise<AuthLoginResponse> {
    return this.authService.login(loginDto, res);
  }

  @UsePublic()
  @UseGuards(RefreshGuard)
  @Get('/refresh')
  refresh(
    @GetCurrentUser() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthRefreshResponse> {
    return this.authService.refresh(user, res);
  }

  @Delete('/logout')
  logout(
    @GetCurrentUser() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(user, res);
  }
}
