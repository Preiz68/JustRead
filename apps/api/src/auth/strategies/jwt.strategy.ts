import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';

import jwtConfig from '@/config/jwt.config';
import { JwtPayload, TokenUser } from '@justread/shared';

type JwtConfig = ConfigType<typeof jwtConfig>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly config: JwtConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.accessSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<TokenUser> {
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  }
}
