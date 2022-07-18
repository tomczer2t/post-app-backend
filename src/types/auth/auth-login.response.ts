export interface AuthLoginResponse {
  success: true;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      avatarURL?: string;
    };
    accessToken: string;
  };
}
