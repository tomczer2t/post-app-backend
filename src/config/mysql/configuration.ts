import { registerAs } from '@nestjs/config';

export const mysqlConfiguration = registerAs('mysql', () => ({
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
}));
