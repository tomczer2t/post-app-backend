import { Injectable, NotFoundException, Post } from '@nestjs/common';
import { CreatePostDto } from './dto';
import { PostEntity } from './entities';
import { UserEntity } from '../users/entities';
import {
  TinyPost,
  PostsListAllResponse,
  PostsGetSpecificResponse,
} from '../../types';
import { SpecificPost } from '../../types/post/specific-post';

@Injectable()
export class PostsService {
  async create(createPostDto: CreatePostDto, user: UserEntity) {
    const post = new PostEntity();
    post.user = user;
    post.title = createPostDto.title;
    post.headline = createPostDto.headline;
    post.content = createPostDto.content;
    post.photoURL = createPostDto.photoURL;
    await post.save();
    return post;
  }

  async listAll({
    page,
    limit,
  }: {
    page?: number;
    limit?: number;
    username?: string;
  }): Promise<PostsListAllResponse> {
    const maxOnPage = 10;
    const currentPage = page || 1;
    const posts = await PostEntity.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: maxOnPage * (currentPage - 1),
      take: limit || maxOnPage,
    });
    return this.filterTinyPosts(posts);
  }

  filterTinyPosts(posts: PostEntity[]): TinyPost[] {
    return posts.map((post) => {
      return {
        id: post.id,
        title: post.title,
        headline: post.headline,
        photoURL: post.photoURL,
        username: post.user.username,
        createdAt: post.createdAt,
        avatarURL: post.user.avatarURL,
      };
    });
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
}
