import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'localhost',
      port: Number(process.env.MAIL_PORT) || 1025,
      secure: process.env.MAIL_SECURE === 'true',
      auth:
        process.env.MAIL_USER
          ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
          : undefined,
    });
  }

  private get from() {
    return process.env.MAIL_FROM || 'Hivecards <noreply@hivecards.local>';
  }

  private get appUrl() {
    return process.env.APP_URL || 'http://localhost:5173';
  }

  async sendVerificationEmail(email: string, token: string) {
    const link = `${this.appUrl}/verify-email?token=${token}`;
    this.logger.log(`Sending verification email to ${email}`);
    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Hivecards – E-Mail-Adresse bestätigen',
      html: `
        <p>Hallo,</p>
        <p>bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Der Link ist 24 Stunden gültig.</p>
        <p>Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>
        <br>
        <p>Dein Hivecards-Team</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const link = `${this.appUrl}/reset-password?token=${token}`;
    this.logger.log(`Sending password reset email to ${email}`);
    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: 'Hivecards – Passwort zurücksetzen',
      html: `
        <p>Hallo,</p>
        <p>du hast das Zurücksetzen deines Passworts angefordert. Klicke auf den folgenden Link:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Der Link ist 1 Stunde gültig.</p>
        <p>Falls du das nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>
        <br>
        <p>Dein Hivecards-Team</p>
      `,
    });
  }
}
