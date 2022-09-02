import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto, PatchStatusDto, QueryDto } from './dto';
import { PostEntity } from './entities';
import { UserEntity } from '../users/entities';
import {
  PostsGetSpecificResponse,
  PostsListAllResponse,
  PostStatus,
  TinyPost,
  UserRole,
} from '../../types';
import { SpecificPost } from '../../types/post/specific-post';
import { DataSource } from 'typeorm';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private dataSource: DataSource) {}
  async create(createPostDto: CreatePostDto, user: UserEntity) {
    const post = new PostEntity();
    post.user = user;
    post.title = createPostDto.title;
    post.headline = createPostDto.headline;
    post.content = createPostDto.content;
    post.photoURL = createPostDto.photoURL;
    if (user.role === UserRole.ADMIN) {
      post.status = PostStatus.ACCEPTED;
    }
    await post.save();
    return { postId: post.id };
  }

  async listAll(queryDto: QueryDto): Promise<PostsListAllResponse> {
    const maxOnPage = 3;
    const currentPage = queryDto.page || 1;

    const query = this.dataSource
      .createQueryBuilder()
      .select('post')
      .from(PostEntity, 'post')
      .where('post.status = 1')
      .skip(maxOnPage * (currentPage - 1))
      .take(queryDto.limit || maxOnPage)
      .leftJoinAndSelect('post.user', 'user');

    if (queryDto.search) {
      query.andWhere('post.title LIKE :search', {
        search: `%${queryDto.search}%`,
      });
    }

    if (queryDto.sortBy === 'author') {
      query.orderBy(`user.username`, queryDto.order === 'asc' ? 'ASC' : 'DESC');
    } else if (queryDto.sortBy) {
      query.orderBy(
        `post.${queryDto.sortBy}`,
        queryDto.order === 'asc' ? 'ASC' : 'DESC',
      );
    } else {
      query.orderBy(`post.createdAt`, 'DESC');
    }

    const [posts, totalCount] = await query.getManyAndCount();
    const totalPages = Math.ceil(totalCount / maxOnPage);
    return { totalPages, posts: this.filterTinyPosts(posts) };
  }

  filterTinyPosts(posts: PostEntity[]): TinyPost[] {
    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      headline: post.headline,
      photoURL: post.photoURL,
      username: post.user.username,
      createdAt: post.createdAt,
      avatarURL: post.user.avatarURL,
    }));
  }

  filterSpecificPost(post: PostEntity): SpecificPost {
    return {
      id: post.id,
      title: post.title,
      headline: post.headline,
      content: post.content,
      photoURL: post.photoURL,
      user: {
        id: post.user.id,
        avatarUrl: post.user.avatarURL,
        username: post.user.username,
      },
    };
  }

  async getSpecific(postId: string): Promise<PostsGetSpecificResponse> {
    const post = await PostEntity.findOne({
      relations: ['user'],
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.filterSpecificPost(post);
  }

  async listPostsByFavouriteAuthors(user: UserEntity) {
    const queryPosts = this.dataSource
      .createQueryBuilder()
      .select('post')
      .from(PostEntity, 'post');
    // .where('post.status = 1');

    if (user.favouriteAuthors.length > 0) {
      queryPosts.where('post.userId in (:favouriteAuthors)', {
        favouriteAuthors: user.favouriteAuthors.map((author) => author.id),
      });
    } else {
      return [];
    }

    const posts = await queryPosts
      .leftJoinAndSelect('post.user', 'user')
      .getMany();
    return this.filterTinyPosts(posts);
  }

  async deletePost(postId: string) {
    const post = await PostEntity.findOneBy({ id: postId });
    console.log({ post });
    await post.remove();
  }

  async listPending() {
    const pendingPosts = await this.dataSource
      .createQueryBuilder()
      .select('post')
      .from(PostEntity, 'post')
      .where('post.status = :status', { status: PostStatus.PENDING })
      .leftJoinAndSelect('post.user', 'user')
      .getMany();
    console.log(pendingPosts);
    return this.filterTinyPosts(pendingPosts);
  }

  async patchStatus(id: string, status: PostStatus) {
    const post = await PostEntity.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    post.status = status;
    await post.save();
    return;
  }

  async updateSpecific(
    postId: string,
    user: UserEntity,
    updatePostDto: UpdatePostDto,
  ) {
    const post = await PostEntity.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    post.user = user;
    post.title = updatePostDto.title;
    post.headline = updatePostDto.headline;
    post.content = updatePostDto.content;
    post.photoURL = updatePostDto.photoURL;
    if (user.role !== UserRole.ADMIN) {
      post.status = PostStatus.PENDING;
    }
    await post.save();
    return { postId: post.id };
  }
}
