import {
  BadRequestException,
  ConflictException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { UserEntity } from '../../models/users/entities';
import { UpdateUserDto } from '../../models/users/dto/update-user.dto';

@Injectable()
export class ValidateUpdateUserPipe implements PipeTransform {
  async transform({ username, email, newPassword, password }: UpdateUserDto) {
    if (username) {
      if (username.length < 4 || username.length > 25) {
        throw new BadRequestException(
          'Username should be between 4 and 25 characters long',
        );
      }
      const usernameExists = !!(await UserEntity.findOneBy({ username }));
      if (usernameExists) {
        throw new ConflictException('Username is already taken');
      }
    }

    if (email) {
      if (!email.includes('@')) {
        throw new BadRequestException('Email should be valid');
      }
      const emailExists = !!(await UserEntity.findOneBy({ email }));
      if (emailExists) {
        throw new ConflictException('Email is already taken');
      }
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        throw new BadRequestException(
          'Password should be at least 8 characters long',
        );
      }
    }
    return { username, email: email?.toLowerCase(), password, newPassword };
  }
}
