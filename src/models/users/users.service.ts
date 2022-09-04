import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto';
import {
  Author,
  GetUserPostsResponse,
  PostStatus,
  UpdateProfileResponse,
  UserPost,
  UsersCreateResponse,
  UsersGetUserWithPostsResponse,
  UserStatus,
  UsersVerifyResponse,
} from '../../types';
import { UserEntity } from './entities';
import { hashData } from '../../common/utils';
import { v4 as uuid } from 'uuid';
import { EmailProviderService } from '../../providers/email/provider.service';
import {
  changeEmailTemplate,
  emailVerificationTemplate,
  refreshVerificationTemplate,
} from '../../providers/email/templates';
import { DataSource } from 'typeorm';
import { PostEntity } from '../posts/entities';
import { UpdateUserDto } from './dto/update-user.dto';
import { compare } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private emailProviderService: EmailProviderService,
    private dataSource: DataSource,
  ) {}

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
    user.status = UserStatus.ACTIVE;
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

  async refreshVerificationCode(
    email: string,
  ): Promise<UsersRefreshVerificationCodeResponse> {
    //@todo move validation to separate pipe
    const user = await UserEntity.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(
        'There is no registered user with such an email.',
      );
    }
    if (user.status === UserStatus.ACTIVE) {
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

    const posts = await this.dataSource
      .createQueryBuilder()
      .select('post')
      .from(PostEntity, 'post')
      .leftJoinAndSelect('post.user', 'user')
      .where('user.username = :username', { username })
      .andWhere('post.status = :status', { status: PostStatus.ACCEPTED })
      .getMany();

    return posts.map((post) => ({
      ...post,
      username: user.username,
      avatarURL: user.avatarURL,
    }));
  }

  async getFavouritesAuthors(user: UserEntity) {
    if (user.favouriteAuthors.length === 0) {
      return [];
    }

    const query = this.dataSource
      .createQueryBuilder()
      .select('user')
      .from(UserEntity, 'user')
      .where('user.id in (:favouriteAuthors)', {
        favouriteAuthors: user.favouriteAuthors.map((author) => author.id),
      })
      .leftJoinAndSelect('user.posts', 'post')
      .addOrderBy('post.createdAt', 'DESC');

    const authors = await query.getMany();

    console.log({ authors });

    const filteredAuthors = authors.map((a) => {
      const acceptedPosts = a.posts.filter(
        (post) => post.status === PostStatus.ACCEPTED,
      );

      const author: Author = {
        username: a.username,
        avatarURL: a.avatarURL,
        postsCount: acceptedPosts.length,
      };
      if (acceptedPosts[0]) {
        const post = acceptedPosts[0];
        author.lastPost = {
          title: post?.title,
          photoURL: post?.photoURL,
          postId: post?.id,
        };
      }
      return author;
    });
    return filteredAuthors;
  }

  async getUserPosts(user: UserEntity): Promise<GetUserPostsResponse> {
    const [entirePosts, count] = await this.dataSource
      .createQueryBuilder()
      .select('post')
      .from(PostEntity, 'post')
      .leftJoin('post.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .orderBy('post.createdAt', 'DESC')
      .getManyAndCount();

    const posts: UserPost[] = entirePosts.map((post) => ({
      id: post.id,
      title: post.title,
      headline: post.headline,
      photoURL: post.photoURL,
      createdAt: post.createdAt,
    }));
    return { posts, count };
  }

  async updateProfile(
    user: UserEntity,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateProfileResponse> {
    if (updateUserDto.email) {
      if (!updateUserDto.password) {
        throw new BadRequestException('Password is required');
      }
      const pwdMatch = await compare(updateUserDto.password, user.password);
      if (!pwdMatch) throw new UnauthorizedException('Wrong password');
      user.newEmail = updateUserDto.email;
      user.verificationCode = uuid();
      const subject = 'Verify email change.';
      const body = changeEmailTemplate(
        user.username,
        user.verificationCode,
        user.newEmail,
      );
      const isSent = await this.emailProviderService.sendMail(
        user.email,
        subject,
        body,
      );
      if (!isSent) {
        user.verificationCode = null;
        user.newEmail = null;
        throw new InternalServerErrorException('Change email not sent.');
      }
    }

    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }

    if (updateUserDto.newPassword) {
      if (!updateUserDto.password) {
        throw new BadRequestException('Password is required');
      }
      const pwdMatch = await compare(updateUserDto.password, user.password);
      if (!pwdMatch) throw new UnauthorizedException('Wrong password');
      user.password = await hashData(updateUserDto.newPassword);
    }

    await user.save();

    return { username: user.username, email: user.email };
  }

  async verifyEmailChange(verificationCode: string) {
    const user = await UserEntity.findOneBy({ verificationCode });
    if (!user) {
      throw new NotFoundException('Wrong confirmation code');
    }
    if (!user.newEmail) {
      throw new BadRequestException('New email is not set.');
    }
    user.verificationCode = null;
    user.email = user.newEmail;
    user.newEmail = null;
    await user.save();
    return { success: true };
  }
}
