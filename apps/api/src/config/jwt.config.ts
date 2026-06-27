import { registerAs } from '@nestjs/config';
import type { StringValue } from 'ms';

export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,

  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN as StringValue,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as StringValue,
}));
