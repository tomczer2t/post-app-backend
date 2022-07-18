import { Module } from '@nestjs/common';
import { EmailConfigModule } from '../../config/email/config.module';
import { HandlebarsAdapter, MailerModule } from '@nest-modules/mailer';
import { EmailConfigService } from '../../config/email/config.service';
import { MailerAsyncOptions } from '@nest-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { EmailProviderService } from './provider.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [EmailConfigModule],
      useFactory: async (emailConfigService: EmailConfigService) => ({
        transport: `smtp://${emailConfigService.user}:${emailConfigService.password}@${emailConfigService.host}:${emailConfigService.port}`,
        defaults: {
          from: emailConfigService.from,
        },
        template: {
          dir: './templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [EmailConfigService],
    } as MailerAsyncOptions),
  ],
  providers: [EmailProviderService],
  exports: [EmailProviderService],
})
export class EmailProviderModule {}
