import { PostStatus } from './post-status';

export interface Post {
  id: string;
  title: string;
  photoURL?: string;
  headline: string;
  content: string;
  userId: string;
  createdAt: Date;
  status: PostStatus;
}
