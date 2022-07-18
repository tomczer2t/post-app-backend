import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app/config.module';
import { MysqlProviderModule } from './providers/mysql/provider.module';
import { UsersModule } from './models/users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailProviderModule } from './providers/email/provider.module';
import { PostsModule } from './models/posts/posts.module';

@Module({
  imports: [
    AppConfigModule,
    // MysqlConfigModule,
    MysqlProviderModule,
    UsersModule,
    AuthModule,
    // EmailConfigModule,
    EmailProviderModule,
    PostsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
