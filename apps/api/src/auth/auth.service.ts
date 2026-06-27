import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from '@justread/shared';
import { UsersService } from '@/users/users.service';
import { TokenService } from '@/token/token.service';
import bcrypt from 'bcrypt';
import { UserMapper } from '@/users/mappers/user.mapper';
import securityConfig from '@/config/security.config';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';

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
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // 1. Check email
    const existingEmail = await this.usersService.findByEmail(dto.email);

    if (existingEmail) {
      throw new ConflictException('Email is already in use.');
    }
    // 2. Check username
    const existingUsername = await this.usersService.findByUsername(
      dto.username,
    );

    if (existingUsername) {
      throw new ConflictException('Username is already taken.');
    }
    // 3. Hash password
    const passwordHash = await this.hashPassword(dto.password);
    // 4. Create user
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      displayName: dto.displayName,
      passwordHash,
    });
    // 5. Generate tokens
    const subject = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const tokens = await this.tokenService.generateTokenPair(subject);

    // 6. Store hashed refresh token
    const refreshTokenHash = await this.tokenService.hashRefreshToken(
      tokens.refreshToken,
    );
    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);
    // 7. Return response
    return {
      user: UserMapper.toAuthenticatedUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
