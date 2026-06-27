export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  emailVerified: boolean;
  createdAt: Date;
}
