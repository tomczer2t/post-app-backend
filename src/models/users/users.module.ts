import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EmailProviderModule } from '../../providers/email/provider.module';
import { CloudinaryModule } from '../../providers/cloudinary/cloudinary.module';

@Module({
  imports: [EmailProviderModule, CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
