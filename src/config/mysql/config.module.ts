import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { mysqlConfiguration } from './configuration';
import * as Joi from 'joi';
import { MysqlConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [mysqlConfiguration],
      validationSchema: Joi.object({
        DB_HOST: Joi.string().default('localhost'),
        DB_USERNAME: Joi.string().default('root'),
        DB_PASSWORD: Joi.string().default('root'),
        DB_DATABASE: Joi.string().required(),
        DB_PORT: Joi.number().default(3306),
      }),
    }),
  ],
  providers: [ConfigService, MysqlConfigService],
  exports: [ConfigService, MysqlConfigService],
})
export class MysqlConfigModule {}
