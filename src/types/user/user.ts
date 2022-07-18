export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  refreshTokenHash?: string;
  status: string;
  confirmationCode?: number;
}
