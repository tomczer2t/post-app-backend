import { TinyPost } from './tiny-post';

export type UserPost = Omit<TinyPost, 'avatarURL' | 'username'>;
