import { registerAs } from '@nestjs/config';

export const appConfiguration = registerAs('app', () => ({
  env: process.env.APP_ENV,
  name: process.env.APP_NAME,
  port: process.env.APP_PORT,
  origin: process.env.APP_ORIGIN,
}));
