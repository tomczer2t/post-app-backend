import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MysqlConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get('mysql.host');
  }
  get username(): string {
    return this.configService.get('mysql.username');
  }
  get password(): string {
    return this.configService.get('mysql.password');
  }
  get database(): string {
    return this.configService.get('mysql.database');
  }
  get port(): number {
    return Number(this.configService.get('mysql.port'));
  }
}
