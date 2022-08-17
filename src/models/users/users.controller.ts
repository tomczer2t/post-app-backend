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
  FavouriteAuthorDto,
  RefreshVerificationCodeDto,
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

  @Patch('/favourite-author')
  toggleFavouriteAuthor(
    @GetCurrentUser() user: UserEntity,
    @Body() { authorUsername }: FavouriteAuthorDto,
  ) {
    return this.usersService.toggleFavouriteAuthor(authorUsername, user);
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

  @Get('/favourite-authors')
  getFavouritesAuthors(@GetCurrentUser() user: UserEntity) {
    return this.usersService.getFavouritesAuthors(user);
  }
}
