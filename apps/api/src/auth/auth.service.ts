import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import bcrypt from 'bcrypt';

import securityConfig from '@/config/security.config';
import { TokenService } from '@/token/token.service';
import { User } from '@/generated/prisma/client';
import { UsersService } from '@/users/users.service';
import { UserMapper } from '@/users/mappers/user.mapper';

import { AuthenticatedUser, AuthResponse } from '@justread/shared';
import { RegisterDto } from './dto/register.dto';

type SecurityConfig = ConfigType<typeof securityConfig>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,

    @Inject(securityConfig.KEY)
    private readonly securityConfig: SecurityConfig,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.securityConfig.bcryptRounds);
  }

  private async comparePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  private async createAuthResponse(user: User): Promise<AuthResponse> {
    const subject = UserMapper.toTokenSubject(user);

    const tokens = await this.tokenService.generateTokenPair(subject);

    const refreshTokenHash = await this.tokenService.hashRefreshToken(
      tokens.refreshToken,
    );

    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);

    return {
      user: UserMapper.toAuthenticatedUser(user),
      ...tokens,
    };
  }

  private static readonly DUMMY_HASH =
    '$2b$10$vSfZMCM5fpqdA7eV7ljDQOz.ETPNJFZJtOxFqn2A92eJbHu5HxKFu';

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingEmail = await this.usersService.findByEmail(dto.email);

    if (existingEmail) {
      throw new ConflictException('Email is already in use.');
    }

    const existingUsername = await this.usersService.findByUsername(
      dto.username,
    );

    if (existingUsername) {
      throw new ConflictException('Username is already taken.');
    }

    const { password, ...userData } = dto;
    const passwordHash = await this.hashPassword(password);

    const user = await this.usersService.create({
      ...userData,
      passwordHash,
    });

    return this.createAuthResponse(user);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.passwordHash) {
      await bcrypt.compare(password, AuthService.DUMMY_HASH);
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await this.comparePassword(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return UserMapper.toAuthenticatedUser(user);
  }

  async login(authenticatedUser: AuthenticatedUser): Promise<AuthResponse> {
    const user = await this.usersService.findById(authenticatedUser.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.createAuthResponse(user);
  }
}
