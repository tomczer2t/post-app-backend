import { registerAs } from '@nestjs/config';

export const emailConfiguration = registerAs('email', () => ({
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  from: process.env.MAIL_FROM,
}));
