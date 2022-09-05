import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  FavouriteAuthorDto,
  RefreshVerificationCodeDto,
} from './dto';
import {
  UpdateProfileResponse,
  UsersCreateResponse,
  UsersGetUserWithPostsResponse,
  UsersVerifyResponse,
} from '../../types';
import {
  ValidateNewUserPipe,
  ValidateUpdateUserPipe,
} from '../../common/pipes';
import { GetCurrentUser, UsePublic } from '../../common/decorators';
import { UserEntity } from './entities';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
  @Get('/verify/email/:verificationCode')
  verifyEmailChange(@Param('verificationCode') verificationCode: string) {
    return this.usersService.verifyEmailChange(verificationCode);
  }

  @UsePublic()
  @Patch('/refresh-verification-code')
  refreshVerificationCode(
    @Body() { email }: RefreshVerificationCodeDto,
  ): Promise<UsersRefreshVerificationCodeResponse> {
    return this.usersService.refreshVerificationCode(email);
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

  @Get('/posts')
  getUserPosts(@GetCurrentUser() user: UserEntity) {
    return this.usersService.getUserPosts(user);
  }

  @Patch('/')
  updateProfile(
    @Body(ValidateUpdateUserPipe) updateUserDto: UpdateUserDto,
    @GetCurrentUser() user: UserEntity,
  ): Promise<UpdateProfileResponse> {
    return this.usersService.updateProfile(user, updateUserDto);
  }

  @Patch('/avatar')
  @UseInterceptors(FileInterceptor('file'))
  updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @GetCurrentUser() user: UserEntity,
  ) {
    return this.usersService.updateAvatar(file, user);
  }

  @Delete('/avatar')
  deleteAvatar(@GetCurrentUser() user: UserEntity) {
    return this.usersService.deleteAvatar(user);
  }
}
