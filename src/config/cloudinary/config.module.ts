import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryConfigService } from './config.service';
import { cloudinaryConfiguration } from './configuration';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [cloudinaryConfiguration],
      validationSchema: Joi.object({
        CLOUDINARY_NAME: Joi.string().required(),
        CLOUDINARY_KEY: Joi.string().required(),
        CLOUDINARY_SECRET: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, CloudinaryConfigService],
  exports: [ConfigService, CloudinaryConfigService],
})
export class CloudinaryConfigModule {}
