import { TinyPost } from './tiny-post';

export interface PostsListAllResponse {
  totalPages: number;
  posts: TinyPost[];
}
