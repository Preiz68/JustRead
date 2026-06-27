import type { AuthenticatedUser } from "./authenticated-user";

export interface AuthResponse {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
}
