import {
  BadRequestException,
  Injectable,
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
      .where('post.status = :status', { status: PostStatus.ACCEPTED })
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
      .leftJoinAndSelect('user.posts', 'posts')
      .addOrderBy('posts.createdAt', 'DESC');

    const authors = await query.getMany();

    const filteredAuthors = authors.map((a) => {
      const post = a.posts[0];
      const author: Author = {
        username: a.username,
        avatarURL: a.avatarURL,
        postsCount: a.posts.length,
      };
      if (post) {
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
      user.email = updateUserDto.email;
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
}
