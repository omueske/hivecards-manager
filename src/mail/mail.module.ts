import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'localhost',
        port: Number(process.env.MAIL_PORT) || 1025,
        secure: process.env.MAIL_SECURE === 'true',
        auth: process.env.MAIL_USER
          ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
          : undefined,
      },
      defaults: {
        from: process.env.MAIL_FROM || 'Hivecards <noreply@hivecards.local>',
      },
      template: {
        dir: join(process.cwd(), 'src', 'mail', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
