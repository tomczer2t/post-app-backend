import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, PatchStatusDto, QueryDto } from './dto';
import {
  GetCurrentUser,
  SetAccessRole,
  UsePublic,
} from '../../common/decorators';
import { UserEntity } from '../users/entities';
import {
  PostsGetSpecificResponse,
  PostsListAllResponse,
  UserRole,
} from '../../types';
import { RoleGuard } from '../../common/guards';
import { UpdatePostDto } from './dto/update-post.dto';

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
    @Query() queryDto: QueryDto,
  ): Promise<PostsListAllResponse> {
    return this.postsService.listAll(queryDto);
  }

  @SetAccessRole(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  @Get('/pending')
  listPending() {
    return this.postsService.listPending();
  }

  @SetAccessRole(UserRole.ADMIN)
  @UseGuards(RoleGuard)
  @Patch('/:id/status')
  patchStatus(@Param('id') id: string, @Body() patchStatusDto: PatchStatusDto) {
    return this.postsService.patchStatus(id, patchStatusDto.status);
  }

  @Patch('/:id')
  updateSpecific(
    @Param('id') postId: string,
    @GetCurrentUser() user: UserEntity,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updateSpecific(postId, user, updatePostDto);
  }

  @Get('/favourite-authors')
  listPostsByFavouriteAuthors(@GetCurrentUser() user: UserEntity) {
    return this.postsService.listPostsByFavouriteAuthors(user);
  }

  @UsePublic()
  @Get('/:postId')
  getSpecific(
    @Param('postId') postId: string,
  ): Promise<PostsGetSpecificResponse> {
    return this.postsService.getSpecific(postId);
  }

  @Delete('/:postId')
  deletePost(@Param('postId') postId: string) {
    return this.postsService.deletePost(postId);
  }
}
