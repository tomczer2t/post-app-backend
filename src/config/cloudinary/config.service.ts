import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryConfigService {
  constructor(private configService: ConfigService) {}

  get cloudName(): string {
    return this.configService.get('cloudinary.cloudName');
  }
  get apiKey(): string {
    return this.configService.get('cloudinary.apiKey');
  }
  get apiSecret(): string {
    return this.configService.get('cloudinary.apiSecret');
  }
}
