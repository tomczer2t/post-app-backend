import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { UserEntity } from '../../models/users/entities';

@Injectable()
export class StatusGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = await UserEntity.findOneBy({ email: req.body.email });
    if (!user) return true;
    if (user.status === 'pending') {
      throw new ForbiddenException('Email is not verified');
    }
    return user.status === 'active';
  }
}
