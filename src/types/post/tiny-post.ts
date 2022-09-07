import { PostStatus } from './post-status';

export interface TinyPost {
  id: string;
  title: string;
  headline: string;
  status: PostStatus;
  photoURL?: string;
  username: string;
  createdAt: Date;
  avatarURL?: string;
}
