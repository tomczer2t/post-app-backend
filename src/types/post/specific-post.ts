import { Post } from './post';
import { User } from '../user';

export interface SpecificPost extends Omit<Post, 'userId'> {
  user: Pick<User, 'id' | 'avatarUrl' | 'username'>;
}
