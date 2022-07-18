import {
  BadRequestException,
  ConflictException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CreateUserDto } from '../../models/users/dto';
import { UserEntity } from '../../models/users/entities';
import { use } from 'passport';

@Injectable()
export class ValidateNewUserPipe implements PipeTransform {
  async transform({ username, email, password }: CreateUserDto) {
    if (!username || !email || !password) {
      throw new BadRequestException('All forms are required');
    }
    if (username.length < 4 || username.length > 25) {
      throw new BadRequestException(
        'Username should be between 4 and 25 characters long',
      );
    }
    if (!email.includes('@')) {
      throw new BadRequestException('Email should be valid');
    }

    if (password.length < 8) {
      throw new BadRequestException(
        'Password should be at least 8 characters long',
      );
    }
    const emailExists = !!(await UserEntity.findOneBy({ email }));
    if (emailExists) {
      throw new ConflictException('Email is already taken');
    }
    const usernameExists = !!(await UserEntity.findOneBy({ username }));
    if (usernameExists) {
      throw new ConflictException('Username is already taken');
    }
    return { username, email: email.toLowerCase(), password };
  }
}
