import { User } from '@/generated/prisma/client';
import { AuthenticatedUser, TokenSubject } from '@justread/shared';

export class UserMapper {
  static toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  static toTokenSubject(user: User): TokenSubject {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}
