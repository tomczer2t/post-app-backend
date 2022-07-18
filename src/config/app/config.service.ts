import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get env(): string {
    return this.configService.get('app.env');
  }
  get name(): string {
    return this.configService.get('app.name');
  }
  get port(): number {
    return Number(this.configService.get('app.port'));
  }
  get origin(): string {
    return this.configService.get('app.origin');
  }
}
