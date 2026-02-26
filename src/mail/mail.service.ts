import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  private get appUrl() {
    return process.env.APP_URL || 'http://localhost:5173';
  }

  async sendVerificationEmail(email: string, token: string, username?: string) {
    const link = `${this.appUrl}/api/v1/auth/verify-email?token=${token}`;
    this.logger.log(`Sending verification email to ${email}`);
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Hivecards – E-Mail-Adresse bestätigen',
        template: 'verify-email',
        context: { link, username },
      });
      this.logger.debug(`Verification email delivered to ${email}`);
    } catch (err: any) {
      this.logger.error(`Failed to send verification email to ${email}: ${err?.message}`);
      throw err;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, username?: string) {
    const link = `${this.appUrl}/reset-password?token=${token}`;
    this.logger.log(`Sending password reset email to ${email}`);
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Hivecards – Passwort zurücksetzen',
        template: 'reset-password',
        context: { link, username },
      });
      this.logger.debug(`Password reset email delivered to ${email}`);
    } catch (err: any) {
      this.logger.error(`Failed to send password reset email to ${email}: ${err?.message}`);
      throw err;
    }
  }
}
