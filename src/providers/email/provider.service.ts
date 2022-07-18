import { Injectable } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';

@Injectable()
export class EmailProviderService {
  constructor(private mailerService: MailerService) {}

  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const sentMailInfo = await this.mailerService.sendMail({
        to,
        subject,
        html,
      });
      console.log({ sentMailInfo });
      return true;
    } catch (error) {
      console.log('EmailProviderService error: ', error);
      return false;
    }
  }
}
