import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../types';

export const SetAccessRole = (...accessRoles: UserRole[]) =>
  SetMetadata('accessRole', accessRoles);
