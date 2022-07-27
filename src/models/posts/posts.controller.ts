import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto';
import { GetCurrentUser, UsePublic } from '../../common/decorators';
import { UserEntity } from '../users/entities';
import { PostsGetSpecificResponse, PostsListAllResponse } from '../../types';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post('/')
  create(
    @Body() createPostDto: CreatePostDto,
    @GetCurrentUser() user: UserEntity,
  ) {
    console.log(createPostDto);
    return this.postsService.create(createPostDto, user);
  }

  @UsePublic()
  @Get('/')
  listAll(
    @Query('limit') limit: string | undefined,
  ): Promise<PostsListAllResponse> {
    return this.postsService.listAll({
      limit: Number(limit),
    });
  }

  @UsePublic()
  @Get('/:postId')
  getSpecific(
    @Param('postId') postId: string,
  ): Promise<PostsGetSpecificResponse> {
    return this.postsService.getSpecific(postId);
  }
}
