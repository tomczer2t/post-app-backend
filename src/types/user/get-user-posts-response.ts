import { UserPost } from '../post';

export interface GetUserPostsResponse {
  posts: UserPost[];
  count: number;
}
