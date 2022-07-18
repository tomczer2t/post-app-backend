import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailConfigService {
  constructor(private configService: ConfigService) {}

  get user(): string {
    return this.configService.get('email.user');
  }
  get password(): string {
    return this.configService.get('email.password');
  }
  get host(): string {
    return this.configService.get('email.host');
  }
  get port(): number {
    return Number(this.configService.get('email.port'));
  }
  get from(): string {
    return this.configService.get('email.from');
  }
}
