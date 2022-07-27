import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto';
import {
  UsersCreateResponse,
  UsersGetUserWithPostsResponse,
  UsersVerifyResponse,
} from '../../types';
import { UserEntity } from './entities';
import { hashData } from '../../common/utils';
import { v4 as uuid } from 'uuid';
import { EmailProviderService } from '../../providers/email/provider.service';
import {
  emailVerificationTemplate,
  refreshVerificationTemplate,
} from '../../providers/email/templates';

@Injectable()
export class UsersService {
  constructor(private emailProviderService: EmailProviderService) {}
  async create({
    username,
    email,
    password,
  }: CreateUserDto): Promise<UsersCreateResponse> {
    const user = new UserEntity();
    user.username = username;
    user.email = email;
    user.password = await hashData(password);
    user.verificationCode = uuid();
    await user.save();
    console.log({ confirmationCode: user.verificationCode });
    const sendEmailSuccess = await this.emailProviderService.sendMail(
      email,
      'Successful registration',
      emailVerificationTemplate(username, user.verificationCode),
    );
    if (!sendEmailSuccess) {
      await user.remove();
      throw new Error('emailProviderService.sendMail() error occured.');
    }
    return {
      success: true,
      data: {
        username: username,
        email: email,
      },
    };
  }

  async verify(verificationCode: string): Promise<UsersVerifyResponse> {
    const user = await UserEntity.findOneBy({ verificationCode });
    if (!user) {
      throw new BadRequestException('Wrong confirmation code');
    }
    user.verificationCode = null;
    user.status = 'active';
    await user.save();
    return { success: true };
  }

  async toggleFavouriteAuthor(authorName: string, user: UserEntity) {
    console.log({ authorName });
    const isAuthorAdded = user.favouriteAuthors.some(
      (favAuthor) => favAuthor.username === authorName,
    );
    if (isAuthorAdded) {
      user.favouriteAuthors = user.favouriteAuthors.filter(
        (favAuthor) => favAuthor.username !== authorName,
      );
    } else {
      const newFavAuthor = await UserEntity.findOneBy({ username: authorName });
      user.favouriteAuthors = [...user.favouriteAuthors, newFavAuthor];
    }
    await user.save();
    return user.favouriteAuthors.map((favAuthor) => favAuthor.username);
  }

  async refreshVerififactionCode(
    email: string,
  ): Promise<UsersRefreshVerificationCodeResponse> {
    //@todo move validation to separate pipe
    const user = await UserEntity.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(
        'There is no registered user with such an email.',
      );
    }
    if (user.status === 'active') {
      throw new BadRequestException(
        'User with such an email is already verified.',
      );
    }
    const lastUpdateTimeStamp = user.updatedAt.getTime();
    if ((Date.now() - lastUpdateTimeStamp) / 60000 < 10) {
      throw new BadRequestException(
        'You need to wait 10 minutes from last sent verification email.',
      );
    }
    const newVerificationCode = uuid();

    const sendEmailSuccess = await this.emailProviderService.sendMail(
      email,
      'New verification code',
      refreshVerificationTemplate(user.username, newVerificationCode),
    );
    if (!sendEmailSuccess) {
      throw new Error('emailProviderService.sendMail() error occured.');
    }
    user.verificationCode = newVerificationCode;
    await user.save();

    return {
      success: true,
      data: {
        email,
      },
    };
  }

  async getUserWithPosts(
    username: string,
  ): Promise<UsersGetUserWithPostsResponse> {
    const user = await UserEntity.findOne({
      where: { username },
      relations: ['posts'],
    });
    return user.posts.map((post) => ({
      ...post,
      username: user.username,
      avatarURL: user.avatarURL,
    }));
  }
}
