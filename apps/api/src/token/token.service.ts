import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '@/config/jwt.config';
import { JwtPayload, TokenPair, TokenSubject } from '@justread/shared';
import { StringValue } from 'ms';
import bcrypt from 'bcrypt';

type JwtConfiguration = ConfigType<typeof jwtConfig>;

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfig: JwtConfiguration,
  ) {}

  private buildPayload(subject: TokenSubject): JwtPayload {
    return {
      sub: subject.id,
      email: subject.email,
      username: subject.username,
    };
  }

  private async signToken(
    payload: JwtPayload,
    secret: string,
    expiresIn: StringValue,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  private async generateAccessToken(subject: TokenSubject): Promise<string> {
    const payload = this.buildPayload(subject);
    return this.signToken(
      payload,
      this.jwtConfig.accessSecret,
      this.jwtConfig.accessExpiresIn,
    );
  }
  private async generateRefreshToken(subject: TokenSubject): Promise<string> {
    const payload = this.buildPayload(subject);
    return this.signToken(
      payload,
      this.jwtConfig.refreshSecret,
      this.jwtConfig.refreshExpiresIn,
    );
  }

  async generateTokenPair(subject: TokenSubject): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(subject),
      this.generateRefreshToken(subject),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
  async hashRefreshToken(refreshToken: string): Promise<string> {
    return bcrypt.hash(refreshToken, 12);
  }

  async compareRefreshToken(
    refreshToken: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(refreshToken, hash);
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.jwtConfig.accessSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: this.jwtConfig.refreshSecret,
    });
  }
}
