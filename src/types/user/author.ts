export interface Author {
  username: string;
  avatarURL: string | undefined;
  postsCount: number;
  lastPost?: {
    title: string;
    photoURL: string | undefined;
    postId: string;
  };
}
