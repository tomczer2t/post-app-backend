import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  RefreshVerificationCodeDto,
  UpdateUserDto,
} from './dto';
import {
  UsersCreateResponse,
  UsersGetUserWithPostsResponse,
  UsersVerifyResponse,
} from '../../types';
import { ValidateNewUserPipe } from '../../common/pipes';
import { GetCurrentUser, UsePublic } from '../../common/decorators';
import { UserEntity } from './entities';

@Controller('/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UsePublic()
  @Post('/')
  create(
    @Body(ValidateNewUserPipe) createUserDto: CreateUserDto,
  ): Promise<UsersCreateResponse> {
    return this.usersService.create(createUserDto);
  }

  @Patch('/')
  update(
    @GetCurrentUser() user: UserEntity,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    console.log({ updateUserDto });
    return 'updated';
  }

  @UsePublic()
  @Get('/verify/:verificationCode')
  verify(
    @Param('verificationCode') verificationCode: string,
  ): Promise<UsersVerifyResponse> {
    return this.usersService.verify(verificationCode);
  }

  @UsePublic()
  @Patch('/refresh-verification-code')
  refreshVerififactionCode(
    @Body() { email }: RefreshVerificationCodeDto,
  ): Promise<UsersRefreshVerificationCodeResponse> {
    return this.usersService.refreshVerififactionCode(email);
  }

  @UsePublic()
  @Get('/')
  getUserWithPosts(
    @Query('username') username: string,
  ): Promise<UsersGetUserWithPostsResponse> {
    return this.usersService.getUserWithPosts(username);
  }
}
