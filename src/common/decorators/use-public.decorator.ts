import { SetMetadata } from '@nestjs/common';

export const UsePublic = () => SetMetadata('isPublic', true);
